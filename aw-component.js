(function($) {
    $.fn.awcomponent = function(args1, args2) {
        var obj = jQuery["awcomponent"][args1];

        if (typeof obj == 'function')
            jQuery["awcomponent"][args1](this, args2);
        else
            console.log('AWComponent :: unknown action');
    };

    $.awcomponent = {
        // property
        formatHandler: null,

        // method
        init: function(target) {
            $.awcomponent.initWidgets(target);
            $.awcomponent.bindFormatEvents(target);
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

            var $target;

            if (target && typeof target == 'string')
                $target = $(target + ' .aw-format');
            else if (target && typeof target == 'object')
                $target = target;
            else
                $target = $('.aw-format');

            $target.unbind('keyup', $.awcomponent.formatHandler)
                .bind('keyup', $.awcomponent.formatHandler)
                .trigger('keyup');
        },

        initWidgets: function(target) {
            if (target && typeof target == 'string')
                target += ' ';
            else
                target = '';

            $('.aw-itembox').each(function(i, el) {
                var options = {};
                var $el = $(el);

                if ($el.attr('data-tmpl')) {
                    var $tmpl = $($el.attr('data-tmpl'));

                    if ($tmpl.length) {
                        var $btn_remove = $tmpl.find('.tmpl_btn_remove');
                        if ($btn_remove.length) {
                            options.tmpl_btn_remove = $btn_remove.prop('outerHTML');
                            $btn_remove.remove();
                        }

                        var $item = $tmpl.find('.tmpl_item');
                        if ($item.length) {
                            options.tmpl_item = $item.prop('outerHTML');
                            $item.remove();
                        }

                        $tmpl.remove();
                    }
                }

                if ($el.attr('data-tmpl-item'))
                    options.tmpl_item = $el.attr('data-tmpl-item');

                if ($el.attr('data-tmpl-btn-remove'))
                    options.tmpl_btn_remove = $el.attr('data-tmpl-btn-remove');

                $el.itembox(options);
            });

            $('.aw-typingtable').typingtable();
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

        escapeHtml: function(text) {
            var map = {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#039;'
            };

            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
        },
    }
})(jQuery);

$.widget('custom.itembox', {
    options: {
        tmpl_box: '<div />',
        tmpl_item: '<div />',
        tmpl_btn_remove: '<button>X</button>',
        is_btn_remove: true
    },

    _create: function() {
        var $target = $(this.element);
        $target.attr('type', 'hidden');

        var $widget = $(this.options.tmpl_box);
        $widget.addClass('aw-widget-itembox')
            .on('click', '.aw-widget-itembox-remove', function(e) {
                e.preventDefault();
                $(this).parent().remove();
            });

        $target.after($widget);

        try {
            console.log($target.val());
            var data = $.parseJSON($target.val());
            console.log(data);
            for (var i in data)
                this.add(data[i]);
        } catch (e) {
            console.log(e);
        }
    },

    add: function(args) {
        var $widget = $(this.element).next();
        if (!$widget.hasClass('aw-widget-itembox')) return;

        if (typeof args == 'string') {
            $row = $(this.options.tmpl_item);
            $row.html(args);
        } else if (typeof args == 'object') {
            $row = $(tmpl(this.options.tmpl_item, args));
        }

        $row.addClass('aw-widget-itembox-row');

        if (this.options.is_btn_remove) {
            var $btn_remove = $(this.options.tmpl_btn_remove);
            $btn_remove.addClass('aw-widget-itembox-remove');
            $row.append($btn_remove);
        }

        $widget.append($row);
    }
});

$.widget('custom.typingtable', {
    options: {},

    _create: function() {
        var $target = $(this.element);
        $target.find('.aw-data-cell').each(function (i, el) {
            var $el = $(el);
            var $input = $('<input />');

            $input.val($el.html());
            $input.attr('name', $el.attr('name'));
            $input.attr('class', $el.attr('class'));
            $input.removeClass('aw-data-cell');

            $el.removeClass('aw-format');
            $el.html($input);
        });
    },

    saveXML: function() {
        var $target = $(this.element);
        var wraptag = $target.attr('name');
        var outputXML = "<" + wraptag + ">\n";
        $target.find('.aw-data-row').each(function(i, el) {
            outputXML += "  <row name=\"" + $(el).attr('name') + "\">\n";
            $(el).children('.aw-data-cell').each(function(i, el2) {
                var tag = $(el2).attr('name');
                outputXML += "    <" + tag + ">";
                outputXML += $.awcomponent.escapeHtml( $(el2).find('input').val() );
                outputXML += "</" + tag + ">\n";
            });
            outputXML += "  </row>\n";
        });
        outputXML += "</" + wraptag + ">";
        return outputXML;
    },

    loadXML: function(xml) {
        this.clearData();

        var $target = $(this.element);
        var wraptag = $target.attr('name');

        var $xml = $( $.parseXML(xml) );
        var $topNode = $xml.children(wraptag);
        if (!$topNode.length) return;

        var $rowElements = $target.find('.aw-data-row');
        var nameCount = {};

        $topNode.children('row').each(function (i, el) {
            var $row = $(el);
            var name = $row.attr('name');

            if (!(name in nameCount))
                nameCount[name] = 0;

            var $cellElements = $($rowElements.filter('[name=' + name + ']').get(nameCount[name]))
                                            .children('.aw-data-cell');

            $row.children().each(function (i, el2) {
                var cellName = el2.tagName;
                $cellElements.filter('[name=' + cellName + ']').find('input').val($(el2).text());
            });

            nameCount[name]++;
        });
    },

    clearData: function() {
        $('.aw-data-cell input').val('');
        this.updateData();
    },

    updateData: function() {
        var $target = $(this.element);
        var $input = $($target.find('.aw-data-table').get(0));
        if (!$input.length) return;

        $input.val(this.saveXML());
    }
});