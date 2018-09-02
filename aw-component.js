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

            $target.off('keyup', $.awcomponent.formatHandler)
                .on('keyup', $.awcomponent.formatHandler)
                .trigger('keyup');
        },

        initWidgets: function(target) {
            if (target && typeof target == 'string')
                target += ' ';
            else
                target = '';

            $('.aw-itembox').each(function(i, el) {
                var options = $.awcomponent.initWidgetTemplateOptions(['btn_remove', 'item', 'box'], el);

                if ($(el).attr('data-is-btn-remove'))
                    options.is_btn_remove = $(el).attr('data-is-btn-remove') == 'false' ? false : true;

                if ($(el).attr('data-box'))
                    options.box = $(el).attr('data-box');

                $(el).itembox(options);
            });

            $('.aw-preupload').each(function(i, el) {
                var options = {};

                // if ($(el).attr('data-preview'))
                //     options.preview = $(el).attr('data-preview');

                if ($(el).attr('data-upload-url'))
                    options.uploadURL = $(el).attr('data-upload-url');

                $(el).preupload(options);
            });

            $('.aw-multiupload').each(function(i, el) {
                var options = {};

                options.itembox_options = $.awcomponent.initWidgetTemplateOptions(['btn_remove', 'item', 'box'], el);

                if ($(el).attr('data-upload-url'))
                    options.uploadURL = $(el).attr('data-upload-url');

                $(el).multiupload(options);
            });

            $('.aw-dataform').each(function(i, el) {
                var template_options = $.awcomponent.initWidgetTemplateOptions(['btn_remove', 'item', 'box'], el);
                $(el).dataform({
                    itembox_options: template_options
                });
            });

            $('.aw-typingtable').typingtable();

            $('.aw-multidropdown').each(function(i, el) {
                var options = {};
                var $el = $(el);

                // if ($el.attr('data-source-url'))
                options.sourceURL = $el.attr('data-source-url');

                if ($el.attr('data-source-keyvalueid')) {
                    try {
                        options.sourceKeyValueID = $.parseJSON($el.attr('data-source-keyvalueid'));
                    } catch (e) {
                        console.log(e);
                    }
                }

                $el.multidropdown(options);
            });
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

        initWidgetTemplateOptions: function(optionNames, el) {
            if (typeof optionNames == 'string')
                optionNames = [optionNames];
            else if (!(optionNames instanceof Array))
                return;

            var options = {};
            var $el = $(el);

            if ($el.attr('data-tmpl')) {
                var $tmpl = $($el.attr('data-tmpl'));

                if ($tmpl.length) {
                    for (var i in optionNames) {
                        var $item_tmpl = $tmpl.find('.tmpl_' + optionNames[i]);
                        if (!$item_tmpl.length)
                            continue;

                        options['tmpl_' + optionNames[i]] = $item_tmpl.prop('outerHTML');

                        if ($item_tmpl.hasClass('action-tmpl-init-remove')) {
                            $item_tmpl.removeClass('action-tmpl-init-remove');
                            $item_tmpl.remove();
                        }
                    }

                    $tmpl.remove();
                }
            }
            // console.log(options);

            for (var i in optionNames) {
                if ($el.attr('data-tmpl' + optionNames[i])) {
                    options['tmpl_' + optionNames[i]] = $el.attr('data-tmpl-' + optionNames[i].replace(/_/g, '-'));
                }
            }

            return options;
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

                    var first_position = num_str.substring(0,2) == '02' ? 2 : 3;
                    var second_position = 7;
                    if (first_position == 2)
                        second_position = num.length > 9 ? 6 : 5;
                    else
                        second_position = num.length > 10 ? 7 : 6;

                    for(var i=0; i<num_str.length; i++) {2
                        var tmp = i;
                        if(i == first_position || i == second_position) result = result+'-'
                        result = result+num_str.charAt(tmp);
                    }

                    return result;

                case 'filesize':
                    var num = Number(text);
                    if (isNaN(num))
                        return '0';

                    var units = ['b', 'kb', 'mb', 'gb'];
                    for (var i in units)
                    {
                        if (num < 1024)
                            break;

                        num /= 1024;
                    }

                    return this.textFormat('number', Math.ceil(num)) + units[i];
            }

            return text;
        },

        toInt: function(str) {
            try {
                var n = parseInt(str.replace(/,/g, ''), 10);
                return isNaN(n) ? 0 : n;
            } catch (e) {
                console.log(e);
                return 0;
            }
        },

        bindFormValues: function(element, data) {
            if (!data)
                data = $(element).attr('data-json') ? $.parseJSON($(element).attr('data-json')) : null;

            if (!data || typeof data !== 'object')
                return false;

            $(element).find('.aw-bind-data').each(function(i, el) {
                var $el = $(el);
                var name = $el.attr('data-bind');
                if ( !name && $el.attr('name') )
                    name = $el.attr('name').replace(/\[\]/g, '');
                if ( !name || !(name in data) )
                    return true; // loop continue

                $.awcomponent.setElementValue(el, data[name]);
            });

            return data;
        },

        getElementValue: function(el) {
            var $el = $(el);
            var result = '';

            $el.trigger('update');

            switch ($el[0].tagName) {
                case "SPAN":
                case "DIV":
                    result = $el.text();
                    break;
                case "IMG":
                    result = $el.attr('src');
                    break;
                case "INPUT":
                    var type = $el.attr('type');
                    if (type == 'checkbox' || type == 'radio') {
                        if (!$el.prop('checked'))
                            break;
                    }
                    // continue below
                default:
                    result = $el.val();
            }

            return result;
        },

        setElementValue: function(el, value) {
            var $el = $(el);

            switch ($el[0].tagName) {
                case "SPAN":
                case "DIV":
                    $el.text(value);
                    break;
                case "IMG":
                    $el.attr('src', value);
                    break;
                case "INPUT":
                    var type = $el.attr('type');
                    if (type == 'checkbox' || type == 'radio') {
                        if (Array.isArray(value))
                            $el.prop('checked', value.indexOf($el.val()) !== -1);
                        else
                            $el.prop('checked', $el.val() == value);

                        break;
                    }
                    // continue below
                default:
                    $el.val(value);
            }

            $el.trigger('load');
        }
    }
})(jQuery);

$.widget('custom.itembox', {
    options: {
        box: null,
        tmpl_box: '<div />',
        tmpl_item: '<div />',
        tmpl_btn_remove: '<button type="button">X</button>',
        is_btn_remove: true,
    },
    $itembox: null,

    _create: function() {
        var $target = $(this.element);
        $target.attr('type', 'hidden');
        $target.addClass('aw-itembox')
            .on('update', $.proxy(this.updateData, this))
            .on('load', $.proxy(this.loadData, this))
            .on('reset', $.proxy(this.clear, this));

        this.$itembox = this.options.box ? $(this.options.box) : $(this.options.tmpl_box).insertAfter($target);
        this.$itembox.addClass('aw-widget-itembox')
            .on('click', '.aw-widget-itembox-remove', function(e) {
                e.preventDefault();
                $(this).parent().remove();
            });

        this.loadData();
    },

    add: function(args) {
        // console.log(args);
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

        this.$itembox.append($row);

        return $row;
    },

    replace: function(originalRow, args) {
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

        $row.insertAfter(originalRow);
        $(originalRow).remove();

        return $row;
    },

    clone: function(originalRow) {
        var $row = $(originalRow).clone();
        this.$itembox.append($row);

        return $row;
    },

    clear: function() {
        this.$itembox.find('.aw-widget-itembox-row').remove();
    },

    getElement: function() {
        return this.$itembox;
    },

    loadData: function() {
        try {
            var val = $(this.element).val();
            if (val[0] != '[')val = '[' + val + ']';
            var data = $.parseJSON(val);
            for (var i in data)
                this.add(data[i]);
        } catch (e) {
            console.log(e);
        }
    },

    updateData: function() {
        var data = [];
        this.$itembox.find('.aw-itembox-data').each(function(i, el) {
            data.push($(el).val());
        });

        $(this.element).val('[' + data.join(',') + ']');
    },
});

$.widget('custom.typingtable', {
    options: {},

    _create: function() {
        var $target = $(this.element);
        $target.addClass('aw-typingtable')
            .on('clear', this.clearData)
            .on('update', this.updateData)
            .on('load', this.loadData);

        this.loadData();
    },

    saveXML: function() {
        var $target = $(this.element);
        var top_attrs = '';

        $.each(this.element[0].attributes, function() {
            if (!this.specified || this.name.indexOf('data-attr-') == -1)
                return true;

            top_attrs += ' ' + this.name.replace('data-attr-', '') + '="' + $.awcomponent.escapeHtml(this.value) + '"';
        });

        var wraptag = $target.attr('name');
        var outputXML = "<" + wraptag + top_attrs + ">\n";
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

        $.each($topNode[0].attributes, function() {
            if (!this.specified)
                return true;

            $target.attr('data-attr-' + this.name, this.value);
        });

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
                $cellElements.filter('[name=' + cellName + ']').find('input')
                                .val($(el2).text())
                                .trigger('keyup');
            });

            nameCount[name]++;
        });

        return $xml;
    },

    clearData: function() {
        $(this.element).find('.aw-data-cell input').val('');
        this.updateData();
    },

    loadData: function() {
        var $target = $(this.element);
        $target.find('.aw-data-cell').each(function (i, el) {
            var $el = $(el);
            var $input = $el.children('input');
            if ($input.length)
                return true;

            $input = $('<input />');
            $input.val($el.html());
            // $input.attr('name', $el.attr('name'));
            $input.attr('class', $el.attr('class'));
            $input.removeClass('aw-data-cell');

            $el.removeClass('aw-format');
            $el.html($input);
        });
    },

    updateData: function() {
        var $target = $(this.element);
        var $input = $($target.find('.aw-data-table').get(0));
        if (!$input.length) return;

        $input.val(this.saveXML());
    },
});

$.widget('custom.multiupload', {
    options: {
        uploadURL: '/upload.php',
        allow_extension: ['doc','docs','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','tif','hwp','txt'],
        itembox: null,
        itembox_options: {},
        maxsize: 10485760,
        onReceived: null // 업로드 결과 반환시 결과 데이터를 인자값으로 넘기고 리턴값으로 결과 재입력
    },
    $fileinput: null,
    $filebox: null,

    _create: function() {
        var $target = $(this.element);

        $target.addClass('aw-multiupload');
        this.$fileinput = $('<input type="file" name="uploadfiles[]" size="1" multiple />');
        this.$fileinput.insertAfter($target);
        this.$fileinput.on('change', $.proxy(this.changeHandler, this));

        if (this.options.itembox) {
            this.$filebox = $(this.options.itembox);
        } else {
            this.$filebox = $target.insertAfter(this.$fileinput).itembox(this.options.itembox_options);
        }

        // try {
        //     uploaded_list = $.parseJSON($target.val());
        //     this.addJSON(uploaded_list);
        // } catch (e) {}
    },

    changeHandler: function(e) {
        var input = e.target;

        if (!input.value)
            return;

        var count = input.files.length;
        for (i=0; i<count; i++) {
            try {
                var filename = input.files[i].name;
                var filesize = input.files[i].size;
                var fileext = filename.split('.').pop().toLowerCase();
            } catch (e) {
                console.log(e);
                continue;
            }

            if ($.inArray(fileext, this.options.allow_extension) === -1) {
                alert("업로드 할 수 없는 파일 유형입니다.");
                input.value = "";
                return;
            }

            var totalsize = filesize;
            if (totalsize > this.options.maxsize)
            {
                alert("파일 용량은 " + (this.options.maxsize/1024/1024) + "MB를 초과할 수 없습니다.");
                input.value = "";
                return;
            }
        }

        if (count > 0) {
            var multiupload = this;
            var $input = $(input);
            var $form = $('<form>')
                        .attr('action', this.options.uploadURL)
                        .attr('method', 'post')
                        .attr('enctype', 'multipart/form-data');

            // $('body').append($form);

            $form.insertAfter($input);
            $form.append($input);

            $form.ajaxForm({
                beforeSubmit: function(data,form,option) {
                    return true;
                },
                success: function (response, status) {
                    uploaded_list = $.parseJSON(response);

                    if (multiupload.options.onReceived)
                        uploaded_list = multiupload.options.onReceived(multiupload.element, uploaded_list);

                    multiupload.addJSON(uploaded_list);
                },
                error: function () {
                    alert("파일 업로드에 실패하였습니다.");
                }
            });
            $form.submit();
            $input.unwrap();
        }

        input.value = '';
    },

    addJSON: function(uploaded_list) {
        for (var i in uploaded_list) {
            var $row = this.$filebox.itembox('add', uploaded_list[i]);
            $row.attr('data-json', JSON.stringify(uploaded_list[i]));
        }
    },

    updateData: function() {
        //this.$filebox.trigger('update'); TODO: 이 값으로 사용할 필요 있음, input를 itembox를 쓸지 multipupload로 쓸지 고려 필요
        var filelist = '[';

        this.$itembox.find('.aw-widget-itembox-row').each(function (i, el) {
            if (i > 0) filelist += ',';
            filelist += $(el).attr('data-json');
        });

        filelist += ']';

        $(this.element).val(filelist);
    },
});

$.widget('custom.preupload', {
    options: {
        uploadURL: '/upload.php',
        allow_extension: ['doc','docs','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','tif','hwp','txt'],
        maxsize: 10485760,
        multiple: false,
        onResult: null
    },
    $fileinput: null,

    _create: function() {
        var $target = $(this.element);

        $target.addClass('aw-preupload');
        this.$fileinput = $('<input type="file" name="uploadfiles[]" size="1" />');
        this.$fileinput.prop('multiple', this.options.multiple)
        this.$fileinput.insertAfter($target);
        this.$fileinput.on('change', $.proxy(this.changeHandler, this));
    },

    _setOption: function(key, value) {
        if (key === "multiple") {
            this.$fileinput.prop('multiple', value);
        }
        this._super(key, value);
    },

    changeHandler: function(e) {
        var input = e.target;

        if (!input.value)
            return;

        var count = input.files.length;
        for (i=0; i<count; i++) {
            try {
                var filename = input.files[i].name;
                var filesize = input.files[i].size;
                var fileext = filename.split('.').pop().toLowerCase();
            } catch (e) {
                console.log(e);
                continue;
            }

            if (!$.inArray(fileext, this.options.allow_extension) === -1) {
                alert("업로드 할 수 없는 파일 유형입니다.");
                input.value = "";
                return;
            }

            var totalsize = filesize;
            if (totalsize > this.options.maxsize)
            {
                alert("파일 용량은 " + (this.options.maxsize/1024/1024) + "MB를 초과할 수 없습니다.");
                input.value = "";
                return;
            }
        }

        if (count > 0) {
            var preupload = this;
            var $input = $(input);
            var $form = $('<form>')
                        .attr('action', this.options.uploadURL)
                        .attr('method', 'post')
                        .attr('enctype', 'multipart/form-data');

            // $('body').append($form);

            $form.insertAfter($input);
            $form.append($input);

            $form.ajaxForm({
                beforeSubmit: function(data,form,option) {
                    return true;
                },
                success: function (response, status) {
                    uploaded_list = $.parseJSON(response);

                    if (preupload.options.onResult)
                        preupload.options.onResult(preupload.element, uploaded_list);
                },
                error: function () {
                    alert("파일 업로드에 실패하였습니다.");
                }
            });
            $form.submit();
            $input.unwrap();
        }

        input.value = '';
    },
});

$.widget('custom.multidropdown', {
    options: {
        sourceURL: '/utils/district/$1/$2',
        sourceKeyValueID: [
            ['category1', 'sido'],
            ['category2', 'sigungu'],
            ['category3', 'dong']
        ]
    },
    $select: null,
    changeHandler: function(e) {
        var select = e.target;
        var index = this.$selects.index(select);

        if (index < (this.$selects.length-1)) {
            var $next_select = this.$selects.eq(index+1);
            this.ajaxGetList($next_select);
        }
    },

    ajaxGetList: function($select) {
        var index = this.$selects.index($select);

        var requestURL = this.options.sourceURL;
        for (var i=0; i<this.$selects.length; i++) {
            var arg = i < index ? this.$selects.eq(i).val() : '';
            requestURL = requestURL.replace('$' + (i+1), arg);
        }

        $select.children().remove();

		$.get(requestURL, $.proxy(function(data) {
			try {
				list = $.parseJSON(data);
                for (var i in list) {
                    var row = list[i];
                    var $option = $('<option>')
                                    .attr('value', row[this.options.sourceKeyValueID[index][0]])
                                    .text(row[this.options.sourceKeyValueID[index][1]]);

                    $select.append($option);
                }
			} catch (err) {
				console.log(err);
            }

            $select.trigger('change');
        }, this));
    },

    _create: function() {
        //TODO: 기본값(수정시 이전 입력값) 고려 필요

        this.$selects = $(this.element).find('.aw-multidropdown-select');
        this.$selects.each(function(e) {
            $(this).children().remove();
            $(this).append('<option value="">-</option>')
        })
        .on('change', $.proxy(this.changeHandler, this));

        this.ajaxGetList(this.$selects.eq(0));

        // for (var i=1; i<this.$selects.length; i++) {

        // }
    }
});

$.widget('custom.dataform', {
    options: {
        writeButtonText: '추가',
        modifyButtonText: '수정'
    },
    $form: null,
    $list: null,
    $btn_submit: null,
    defaultFormDatas: {},
    modifyItem: null,

    _create: function() {
        var $target = $(this.element);
        $target.addClass('aw-previewimage');

        this.$form = $target.find('.aw-dataform-form');
        this.$list = this.options.itembox ? $(this.options.itembox) : $target.find('.aw-dataform-list');
        this.$btn_submit = this.$form.find('.aw-action-submit');

        this.defaultFormDatas = this.getFormDatas();

        this.$form.on('click', '.aw-action-submit', $.proxy(function(e) {
                e.preventDefault();

                var data = this.getFormDatas();

                if (this.modifyItem) {
                    this.$list.itembox('replace', this.modifyItem, data);
                } else {
                    this.$list.itembox('add', data);
                }

                $target.trigger('change');

                this.changeWrite();
            }, this))
        .on('click', '.aw-action-cancel', $.proxy(function(e) {
                e.preventDefault();

                this.changeWrite();
            }, this));

        $target.on('click', '.aw-action-modify', $.proxy(function(e) {
                e.preventDefault();
                var $row = $(e.target).closest('.aw-widget-itembox-row');
                $target.trigger('change');
                this.changeModify($row);
            }, this))
        .on('click', '.aw-action-clone', $.proxy(function(e) {
                e.preventDefault();
                var $row = $(e.target).closest('.aw-widget-itembox-row');
                this.$list.itembox('clone', $row);
                $target.trigger('change');
            }, this))
        .on('click', '.aw-action-delete', function(e) {
            e.preventDefault();
            $(e.target).closest('.aw-widget-itembox-row').remove();
            $target.trigger('change');
        });

        try {
            list = $.parseJSON($target.val());

            for (var i in list) {
                var $row = this.$list.itembox('add', list[i]);
            }
        } catch (e) {}
    },

    getFormDatas: function() {
        var data = {};

        this.$form.find('.aw-dataform-item').each($.proxy(function(i, el) {
            data[$(el).attr('data-bind')] = $.awcomponent.getElementValue(el); // TODO: 아이템박스 데이터 json으로 처리할것!
        }, this));

        return data;
    },

    initForm: function(e) {
        this.$form.find('.aw-dataform-item').each($.proxy(function(i, el) {
            var $el = $(el);
            $.awcomponent.setElementValue(el, this.defaultFormDatas[$el.attr('data-bind')]);
            $el.trigger('reset');
        }, this));
    },

    changeWrite: function() {
        this.initForm();
        this.$btn_submit.text(this.options.writeButtonText);
        this.modifyItem = null;
    },

    changeModify: function(item) {
        this.initForm();

        var data = {};
        try {
            var $data_row = $(item).find('.aw-data-json');
            data = $.parseJSON($.awcomponent.getElementValue($data_row));
        } catch (e) {}

        $(item).find('.aw-bind-data').each($.proxy(function(i, el) {
            try {
                data[$(el).attr('data-bind')] = $.awcomponent.getElementValue(el);
            } catch (e) {}
        }), this);

        this.$form.find('.aw-dataform-item').each($.proxy(function(i, el) {
            try {
                $.awcomponent.setElementValue(el, data[$(el).attr('data-bind')]);
            } catch (e) {}
        }), this);

        this.$btn_submit.text(this.options.modifyButtonText);
        this.modifyItem = item;
    },

    getModifyItem: function() {
        return this.modifyItem;
    }
});
