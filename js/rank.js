var rank_timer = setInterval(function () {
    if ($('tr .center').length > 0) {
        renderRank();
        window.clearInterval(rank_timer);
    }
}, 100);

function renderRank() {
    var list = $('tbody').children();
    let count = 0;
    let calendar_event = [];
    for (i = 0; i < list.length; i++) {
        var item = $(list[i]);
        if (!item.children().eq(1).text()) {
            continue;
        }
        var site_name = item.find('.caption').text();
        console.log(site_name);
        if (!site_name) {
            continue;
        }
        var site_url = item.find('.caption').parent();
        if (!site_url) {
            continue;
        }
        site_url = site_url.attr('href');
        console.log(site_url);

        var site_avatar_div = item.find('.v-avatar');
        var site_avatar_img = '';
        if (site_avatar_div.length > 0) {
            site_avatar_img = site_avatar_div.find('img');
            if (site_avatar_img.length > 0) {
                site_avatar_img = site_avatar_img.attr('src');
            }
        }

        var register_date = item.children().filter(function () {
            return $(this).attr('title');
        });
        if (!register_date.length) {
            continue;
        }
        register_date = register_date.attr('title');
        if (!register_date) {
            continue;
        }
        var register_time = new Date(register_date).getTime() / 1000;

        var download_upload = item.children('.number').eq(0);
        if (!download_upload.length) {
            continue;
        }

        var download_item = $(download_upload).children().eq(1);
        var upload_item = $(download_upload).children().eq(0);

        if (!download_item.length || !upload_item.length) {
            continue;
        }
        
        var download = download_item.text().replace(/expand_less/, '').replace(/expand_more/, '').replace(/[\r\n]/g, "").replace(/\ +/g, "");
        var upload = upload_item.text().replace(/expand_less/, '').replace(/expand_more/, '').replace(/[\r\n]/g, "").replace(/\ +/g, "");

        download = size2Bytes(download);
        upload = size2Bytes(upload);
        
        var site_rank = getSiteRank(site_url);
        if (site_rank === undefined || site_rank.length === 0) {
            continue;
        }
        
        var user_level = item.children().eq(2).text();
        console.log(user_level);
        user_level = parseUserLevel(user_level);
        var user_level_index = 0;
        for (j = 0; j < site_rank.length; j ++) {
            rank_level = site_rank[j]['name'];
            rank_level = parseUserLevel(rank_level);
            if (user_level === rank_level) {
                user_level_index = j;
                break;
            }
        }
        level_requirement = site_rank[user_level_index+1];
        current_time = Date.parse(new Date()) / 1000;
        require_level_name = level_requirement['name'];
        require_time = level_requirement['week'] * 7 * 86400 + register_time;
        require_download = size2Bytes(level_requirement['download']);
        require_upload = require_download * level_requirement['ratio'];
        
        title_color = 'black';
        green_color = 'green';
        red_color = 'red';
        info_color = 'grey';
        function getHintColor(bool) {
            return bool ? green_color : red_color;
        }
        
        is_reach = current_time >= require_time;
        level_string = is_reach ? require_level_name : timestamp2Date(require_time) + ' 达到 ' + require_level_name;
        venderList(item, '<br>' + genSpan(level_string, title_color));
        
        is_reach = upload >= require_upload;
        upload_string = is_reach ? bytes2Size(require_upload) + '↑' : bytes2Size(require_upload) + '↑' + ' 还差 ' + bytes2Size(require_upload - upload) + '↑';
        venderList(item, '<br>' + genSpan(upload_string, getHintColor(is_reach)));
        
        is_reach = download >= require_download;
        download_string = is_reach ? bytes2Size(require_download) + '↓' : bytes2Size(require_download) + '↓' + ' 还差 ' + bytes2Size(require_download - download) + '↓';
        venderList(item, '<br>' + genSpan(download_string, getHintColor(is_reach)));
        
        let mouseover_content = '';
        for (j = 0; j < site_rank.length; j++) {
            require_time = site_rank[j]['week'] * 7 * 86400;
            reach_time = require_time + register_time;
            require_download = size2Bytes(site_rank[j]['download']);
            require_upload = require_download * site_rank[j]['ratio'];
            
            is_reach = j <= user_level_index;
            span = genSpan(is_reach ? '✔' : '✘', getHintColor(is_reach));
            mouseover_content += span;
            if (require_time > 0 || require_upload > 0 || require_download > 0) {
                if (require_time > 0) {
                    span = genSpan(timestamp2Date(reach_time) + ' ' + site_rank[j]['name'], title_color);
                    mouseover_content += span;
                }
                else {
                    span = genSpan(site_rank[j]['name'], title_color);
                    mouseover_content += span;
                }
                if (require_upload > 0) {
                    span = genSpan(' ' + bytes2Size(require_upload) + '↑', getHintColor(upload >= require_upload));
                    mouseover_content += span;
                }
                if (require_download > 0) {
                    span = genSpan(' ' + bytes2Size(require_download) + '↓', getHintColor(download >= require_download));
                    mouseover_content += span;
                }
            }
            else {
                span = genSpan(site_rank[j]['name'], title_color);
                mouseover_content += span;
                span = genSpan(' ' + site_rank[j]['info'], info_color);
                mouseover_content += span;
            }
            mouseover_content += '<br>';
        }

        if (mouseover_content) {
            let mouserover_div = document.createElement('div');
            item.children().eq(2).append(mouserover_div);
            $(mouserover_div).attr('style', 'position: absolute; background-color: white;');
            item.children().eq(2).on('mouseover', function () {
                mouserover_div.style.left = event.clientX;
                mouserover_div.style.top = event.clientY;
                mouserover_div.style.display = 'block';
                mouserover_div.style.zIndex = '999';
                mouserover_div.style.border = '1px solid black';
                $(mouserover_div).html(mouseover_content);
            });

            item.children().eq(2).on('mouseout', function () {
                mouserover_div.style.display = 'none';
                mouserover_div.innerHTML = '';
            });
        }

    }
}

function genSpan(content, color) {
    span = '<span style="color: ' + color + '">' + content + '</span>';
    return span;
}

function venderList(item, span) {
    item = item.children().eq(2);
    item.append(span);
}

function size2Bytes(size) {
    if (size.indexOf('KiB') !== -1 || size.indexOf('KB') !== -1 || size.indexOf('K') !== -1) {
        return parseFloat(size) * Math.pow(2, 10);
    }
    if (size.indexOf('MiB') !== -1 || size.indexOf('MB') !== -1 || size.indexOf('M') !== -1) {
        return parseFloat(size) * Math.pow(2, 20);
    }
    if (size.indexOf('GiB') !== -1 || size.indexOf('GB') !== -1 || size.indexOf('G') !== -1) {
        return parseFloat(size) * Math.pow(2, 30);
    }
    if (size.indexOf('TiB') !== -1 || size.indexOf('TB') !== -1 || size.indexOf('T') !== -1) {
        return parseFloat(size) * Math.pow(2, 40);
    }
    if (size.indexOf('PiB') !== -1 || size.indexOf('PB') !== -1 || size.indexOf('P') !== -1) {
        return parseFloat(size) * Math.pow(2, 50);
    }
    return 0;
}

function bytes2Size(bytes) {
    if (isNaN(bytes)) {
        return '';
    }
    var symbols = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var exp = Math.floor(Math.log(bytes) / Math.log(2));
    if (exp < 1) {
        exp = 0;
    }
    var i = Math.floor(exp / 10);
    bytes = bytes / Math.pow(2, 10 * i);

    if (bytes.toString().length > bytes.toFixed(2).toString().length) {
        bytes = bytes.toFixed(2);
    }
    return bytes + ' ' + symbols[i];
}

function timestamp2Date(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.getFullYear() + '-' + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' + ((date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate());
}

function parseUrl(url) {
    let urlObj = {
        protocol: /^(.+)\:\/\//,
        host: /\:\/\/(.+?)[\?\#\s\/]/,
        path: /\w(\/.*?)[\?\#\s]/,
        query: /\?(.+?)[\#\/\s]/,
        hash: /\#(\w+)\s$/
    }
    url += ' '

    function formatQuery(str) {
        return str.split('&').reduce((a, b) => {
            let arr = b.split('=')
            a[arr[0]] = arr[1]
            return a
        }, {})
    }

    for (let key in urlObj) {
        let pattern = urlObj[key]
        urlObj[key] = key === 'query' ? (pattern.exec(url) && formatQuery(pattern.exec(url)[1])) : (pattern.exec(url) && pattern.exec(url)[1])
    }
    return urlObj
}

function parseUserLevel(level) {
    let re = new RegExp("\\w+\\s?\\w+", "g");
    levels = level.match(re);
    if (levels !== null)
        level = levels[0];
    return level;
}

function getDate() {
    var date, year, month, day, hour, minute, second;
    date = new Date();
    year = date.getFullYear();
    month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    day = date.getDate < 10 ? "0" + date.getDate() : date.getDate();
    hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return year + "-" + month + "-" + day + "_" + hour + "-" + minute + "-" + second;
}

function getSiteRank(site_url) {
    site = parseUrl(site_url).host;
    rank = site_level_requirements[site];
    return rank;
}