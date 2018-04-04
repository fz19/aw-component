(function($) {
    $.awcomponent = {
        init: function() {
            $.awcomponent.bindFormatEvents();
            $.awcomponent.disableBackspaceKey();
        },

        bindFormatEvents: function(target) {
            if (!$.awcomponent.formatHandler) {
                $.awcomponent.formatHandler = function(e) {
                    if ($(this).hasClass('aw-format-number')) {
                        $(this).val($.awcomponent.textFormat('number', $(this).val()));
                    } else if ($(this).hasClass('aw-format-date')) {
                        $(this).val($.awcomponent.textFormat('date', $(this).val()));
                    } else if ($(this).hasClass('aw-format-time')) {
                        $(this).val($.awcomponent.textFormat('time', $(this).val()));
                    } else if ($(this).hasClass('aw-format-phone')) {
                        $(this).val($.awcomponent.textFormat('phone', $(this).val()));
                    }
                }
            }

            if (target && typeof target == 'string')
                target += ' ';
            else
                target = '';

            $(target + '.aw-format')
                .unbind('keyup', $.awcomponent.formatHandler)
                .bind('keyup', $.awcomponent.formatHandler)
                .trigger('keyup');
        },

        disableBackspaceKey: function() {
            document.onkeydown = function(event) {
                event = event || window.event;
                var target = event.target || event.srcElement;
                if (target.type == "text" || target.type == "textarea") {
                    if(event.keyCode==8 && $(event.srcElement).attr('readonly')) {
                        return false;
                    }
                }else{
                    if(event.keyCode==8) return false;
                }
            }
        },

        textFormat: function(format, text) {
            switch (format) {
                case 'number':
                    var num = $.trim(String(text));
                    if (num == '-' || num == '') return num;

                    num = num.replace(/,/g, "");
                    var num_str = num.toString();
                    var result = '';

                    if (isNaN(Number(num_str)))
                        return '';

                    for(var i=0; i<num_str.length; i++) {
                        var tmp = num_str.length-(i+1)
                        if(i%3==0 && i!=0) result = ',' + result
                        result = num_str.charAt(tmp) + result
                    }

                    result = result.replace('-,','-');

                    return result;

                case 'date':
                    var num = String(text);
                    num = num.replace(/-/g, "").substring(0,8);
                    var num_str = num.toString();
                    var result = '';

                    if (isNaN(Number(num_str)))
                        return '';

                    for(var i=0; i<num_str.length; i++) {
                        var tmp = i;
                        if(i==4 || i == 6 || i ==8) result = result+'-'
                        result = result+num_str.charAt(tmp);
                    }

                    return result;

                case 'time':
                    var num = String(text);
                    num = num.replace(/:/g, "").substring(0,6);
                    var num_str = num.toString();
                    var result = '';

                    if (isNaN(Number(num_str)))
                        return '';

                    for(var i=0; i<num_str.length; i++) {
                        var tmp = num_str.length-(i+1)
                        if(i==2 || i == 4) result = ':' + result
                        result = num_str.charAt(tmp) + result
                    }

                    return result;

                case 'phone':
                    var num = String(text);
                    num = num.replace(/-/g, "").substring(0,11);
                    var num_str = num.toString()
                    var result = '';

                    var second_position = num.length > 10 ? 7 : 6;

                    for(var i=0; i<num_str.length; i++) {
                        var tmp = i;
                        if(i == 3 || i == second_position) result = result+'-'
                        result = result+num_str.charAt(tmp);
                    }

                    return result;
            }

            return text;
        }
    }
})(jQuery);