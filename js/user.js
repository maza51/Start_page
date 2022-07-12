(function(){
    var MAX_TABS = 5
    var WIDGHT_TAB = 0
    var HEIGHT_TAB = 0
    var WOT = 0
    var TABS = {}
    var DATA = {}
    var DATA_F = {}
    var BG_IMAGE
    var DRAGGING = false
    var PAGE = 0

    function Tab() {}

    // TABS
    Tab.prototype = {

        create : function (id, url, img, folder) {
            this.div_tab = document.createElement('div')
            this.div_tab.id = id
            this.div_tab.className = 'tab'
            if (folder > 0) {
                this.div_tab.appendChild(this.get_snapshot_fold(folder))
            }
            else {
                this.div_tab.appendChild(this.get_snapshot(url, img))
            }
            this.div_tab.appendChild(this.get_bd(id))
            //ne sprashivat za4em
            if (folder == 0 && id < 1000) {
                this.div_tab.appendChild(this.get_bf(id))
            }
        },

        get_snapshot : function (url, img) {
            var snapshot = document.createElement('div')
            snapshot.style.width = WIDGHT_TAB
            snapshot.style.height = HEIGHT_TAB
            snapshot.style.backgroundImage = 'url(' + img + ')'
            snapshot.className = 'snapshot'
            snapshot.onclick = function() {
                if (DRAGGING) {
                    return
                }
                this.style.opacity = '0.4'
                location.href = url
            }
            return snapshot
        },

        get_snapshot_fold : function (folder) {
            var snapshot = document.createElement('div');
            snapshot.style.width = WIDGHT_TAB
            snapshot.style.height = HEIGHT_TAB
            snapshot.className = 'snapshot'
            var strip = 0
            for (var i in DATA_F) {
                if (DATA_F[i].folder == folder) {
                    var a = document.createElement('a')
                    var img = document.createElement('img')
                    img.style.width = WIDGHT_TAB / 2 - 4
                    img.style.height = HEIGHT_TAB / 2 - 4
                    img.src = DATA_F[i].img
                    a.appendChild(img)
                    snapshot.appendChild(a)
                    strip++
                }
                if (strip > 3) {
                    break
                }
            }
            snapshot.onclick = function(e) {
                if (DRAGGING) {
                    return
                }
                show_folder(folder)
                drag_n_drop_init()
            }
            return snapshot
        },

        get_bd : function (id) {
            var bd = document.createElement('div')
            bd.className = 'bd'
            bd.title = 'Delete'
            bd.onclick = function() {
                if (DRAGGING) {
                    return
                }
                delete_tab(id)
                location.reload()
            }
            return bd
        },

        get_bf : function (id) {
            var bf = document.createElement('div')
            bf.className = 'bf'
            bf.title = 'Add folder'
            bf.onclick = function() {
                move_to_fold(id, 0)
            }
            return bf
        }
    }


    move_to_fold = function(id, last_fold) {
        var data_this_folder = JSON.parse(JSON.stringify(DATA[id]))
        var number_tabs_in_fold = 0
        for (var i in DATA_F) {
            number_tabs_in_fold = i
        }
        if (last_fold > 0) {
            data_this_folder.folder = last_fold
            DATA_F[Number(number_tabs_in_fold) + 1] = data_this_folder
        } else {
            var number_fold = 0
            for (var i in DATA) {
                if (DATA[i].folder > number_fold) {
                    number_fold = DATA[i].folder
                }
            }
            DATA[id].url = 'Folder'
            DATA[id].title = ''
            DATA[id].img = ''
            DATA[id].folder = Number(number_fold) + 1
            data_this_folder.folder = Number(number_fold) + 1
            DATA_F[Number(number_tabs_in_fold) + 1] = data_this_folder
        }
        chrome.extension.getBackgroundPage().sp.upData(DATA, DATA_F)
        location.reload()
    }
    

    show_tabs = function() {
        PAGE = 0
        var div_sites = document.getElementById('sites')
        div_sites.style.padding = "0 "+(WOT-1)

        for (var i in DATA) {
            TABS[i] = new Tab()
            TABS[i].create(i, DATA[i].url, DATA[i].img, DATA[i].folder)
            div_sites.appendChild(TABS[i].div_tab)
        }
        
        //Animation
        for (var i in TABS) {
            TABS[i].div_tab.style.opacity = 0
            TABS[i].div_tab.style.transition = "all 0s ease"
            TABS[i].div_tab.style.transform = "translateY(+40px) rotateX(4deg)"
            setTimeout(function(i) {
                TABS[i].div_tab.style.opacity = 1
                TABS[i].div_tab.style.transition = "all 0.5s ease"
                TABS[i].div_tab.style.transform = "translateY(0px) rotateX(0deg)"
            }.bind(this, i), 40*i)
        }
    }


    show_folder = function(folder) {
        PAGE = 1
        for (var i in TABS) {
            TABS[i].div_tab.remove()
            delete TABS[i]
        }

        var div_sites = document.getElementById('sites')
        div_sites.style.padding = "0 "+(WOT-1)
        var n = 0
        for (i in DATA_F) {
            if (DATA_F[i].folder == folder) {
                TABS[n] = new Tab()
                TABS[n].create(1000+Number(n), DATA_F[i].url, DATA_F[i].img, 0)
                div_sites.appendChild(TABS[n].div_tab)
                n++
            }
        }

        //Animation
        for (var i in TABS) {
            TABS[i].div_tab.style.opacity = 0
            TABS[i].div_tab.style.transition = "all 0s ease"
            TABS[i].div_tab.style.transform = "translateY(+40px) rotateX(4deg)"
            setTimeout(function(i) {
                TABS[i].div_tab.style.opacity = 1
                TABS[i].div_tab.style.transition = "all 0.5s ease"
                TABS[i].div_tab.style.transform = "translateY(0px) rotateX(0deg)"
            }.bind(this, i), 40*i)
        }
        document.getElementById('st').innerHTML += " > <a href=''>Folder "+ folder +"</a>"
    }


    delete_tab = function(id) {

        if (id >= 1000) {
            var size_data = get_size_obj(DATA_F)
            for (i = (id-1000), len = size_data; i < len; i++) {
                DATA_F[i] = DATA_F[Number(i) + 1]
            }
            delete DATA_F[size_data]
            chrome.extension.getBackgroundPage().sp.upData(DATA, DATA_F)
            return
        }

        if (DATA[id].folder > 0) {
            for (var i in DATA_F) {
                if (DATA_F[i].folder == DATA[id].folder) {
                    delete DATA_F[i]
                }
            }
        }

        var size_data = get_size_obj(DATA)
        for (i = id, len = size_data; i < len; i++) {
            DATA[i] = DATA[Number(i) + 1]
        }
        delete DATA[size_data]
        chrome.extension.getBackgroundPage().sp.upData(DATA, DATA_F)
    }


    drag_n_drop_init = function() {
        //Drag n Drop jquery
        var timer
        $('.tab').draggable({ stack: ".tab", revert: "invalid", revertDuration: 250, opacity: 0.60, scroll: false,
            start: function( event, ui ) {
                $(this).css('transition', 'none')
                DRAGGING = true
            },
            stop:function( event, ui ) {
                $(this).css('transition', 'all 0.3s ease')
                setTimeout(function(self) {
                     DRAGGING = false
                }.bind(this, self), 200);
            }
        })
        $('.tab').droppable({ accept: ".tab", hoverClass: "hover",
            drop: function( event, ui ) {
                ui.draggable.draggable('option','revert',true)
                $(this).css('transition', 'all .1s ease')
                swap_tab(ui.draggable.attr("id"), event.target.id)
            },
            activate: function() {
                $(this).css('opacity', 0.8)
            },
            deactivate: function() {
                $(this).css('opacity', 1.0)
            }
        })
    }


    loader = function(return_number) {
        try {
            if (chrome.extension.getBackgroundPage().sp.complete <3) {
                setTimeout(function() {
                    if (return_number > 0) { 
                        loader(return_number-1)
                    }
                }, 1000)
                console.log(chrome.extension.getBackgroundPage().sp.complete)
                console.log('Background page not complete')
                return
            }

            document.getElementById('loader').style.display = 'none'
            DATA = chrome.extension.getBackgroundPage().sp.Data
            DATA_F = chrome.extension.getBackgroundPage().sp.DataF
            BG_IMAGE = chrome.extension.getBackgroundPage().sp.bgImage;
            if (BG_IMAGE) {
                document.body.style.backgroundImage = 'url(' + BG_IMAGE + ')';
                document.body.style.backgroundSize = '100% 100%';
            }
            if (get_size_obj(DATA) == 0) {
                document.getElementById('helper').style.display = 'block'
            }
            show_tabs()
            drag_n_drop_init()
        }
        catch (exception_var) {
            setTimeout(function() {
                if (return_number > 0) { 
                    loader(return_number-1)
                }
            }, 1000)
        }
    }


    window.onload = function() {
        client_widgth = document.documentElement.clientWidth
        if (!client_widgth) {
            location.reload()
            return
        }
        WOT = client_widgth / 16;
        WIDGHT_TAB = Math.floor((client_widgth - (WOT * 2)) / MAX_TABS) - 20
        HEIGHT_TAB = Math.floor(WIDGHT_TAB / 1.7)

        add_nav_events()
        loader(20)
        $( document ).tooltip();
    }

    window.onresize = function(e) {
        //location.reload()
    }
    
    //Create events for nav. panel
    add_nav_events = function() {
        document.getElementById('btnapp').onclick = function() {
            chrome.tabs.update(null, {
                'url': 'chrome://apps/',
                'selected': true
            })
        }

        document.getElementById('btnhis').onclick = function() {
            chrome.tabs.update(null, {
                'url': 'chrome://history/',
                'selected': true
            })
        }

        var btn_pic = document.getElementById('btnpic')
        btn_pic.onclick = function() {
            var tmp = document.getElementById('bgimage')
            if (!tmp) {
                var input = document.createElement("input")
                input.id = 'bgimage'
                input.placeholder = " http://..."
                input.onkeyup = function(e) {
                    e = e || window.event;
                    if (e.which == 13) {
                        chrome.extension.getBackgroundPage().sp.imageto64(this.value)
                    }
                }
                btn_pic.appendChild(input)
            }
        }

        document.getElementById('btnset').onclick = function() {
            chrome.tabs.update(null, {
                'url': '/options.html',
                'selected': true
            })
        }
    }

    // tab1 кто tab2 в кого
    swap_tab = function(tab1, tab2) {
        var data = PAGE ? DATA_F : DATA
        if (PAGE) {
            var data = DATA_F
            tab1 = tab1 - 1000
            tab2 = tab2 - 1000
        }
        else {
            var data = DATA
        }

        if (data[tab2].folder > 0) {
            if (data[tab1].folder == 0) {
                move_to_fold(tab1, data[tab2].folder)
                delete_tab(tab1)
                location.reload()
                return
            }
        }
        var snapshot1 = TABS[tab1].div_tab.getElementsByClassName('snapshot')[0]
        var snapshot2 = TABS[tab2].div_tab.getElementsByClassName('snapshot')[0]
        var tmp_s1 = snapshot1
        var tmp_s2 = snapshot2
        snapshot1.remove()
        snapshot2.remove()
        TABS[tab1].div_tab.insertBefore(tmp_s2, TABS[tab1].div_tab.getElementsByClassName('bd')[0])
        TABS[tab2].div_tab.insertBefore(tmp_s1, TABS[tab2].div_tab.getElementsByClassName('bd')[0])

        var tmp_obj = data[tab1]
        data[tab1] = data[tab2]
        data[tab2] = tmp_obj
        chrome.extension.getBackgroundPage().sp.upData(DATA, DATA_F)
        //location.reload()
    }


    get_size_obj = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size
    }

})()