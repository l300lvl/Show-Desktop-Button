const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Main = imports.ui.main;
const Layout = imports.ui.layout;
const Tweener = imports.ui.tweener;
const Overview = imports.ui.overview;
const Panel = imports.ui.panel;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Signals = imports.signals;
const Meta = imports.gi.Meta;
const AppDisplay = imports.ui.appDisplay;
const AltTab = imports.ui.altTab;
const Gio = imports.gi.Gio;

//the following line lets you choose placement options, center is to the left of the clock and center2 is to the right of it.
const TOP_BOX = 'left'; //options are left, right, center, center2, there is also left2 as an alternate left option.
//dont touch anything below this line
function ShowDesktopButton() {
    this._init();
}

ShowDesktopButton.prototype = {

    _init: function() {
        this.actor = new St.Button({style_class: "desktop", can_focus: true, reactive: true, track_hover: true});
        let icon = new St.Icon();
        this.actor.add_actor(icon);
        this.actor.connect("clicked", Lang.bind(this, this._toggleShowDesktop));
        
        this._tracker = Shell.WindowTracker.get_default();
        
        this._desktopShown = false;
        
        this._alreadyMinimizedWindows = [];
    },
      
    _toggleShowDesktop: function() {
        Main.overview.hide();
        let metaWorkspace = global.screen.get_active_workspace();
        let windows = metaWorkspace.list_windows();
        
        if (this._desktopShown) {
            for ( let i = 0; i < windows.length; ++i ) {
                if (this._tracker.is_window_interesting(windows[i])){                   
                    let shouldrestore = true;
                    for (let j = 0; j < this._alreadyMinimizedWindows.length; j++) {
                        if (windows[i] == this._alreadyMinimizedWindows[j]) {
                            shouldrestore = false;
                            break;
                        }                        
                    }    
                    if (shouldrestore) {
                        windows[i].unminimize();                                  
                    }
                }
            }
            this._alreadyMinimizedWindows.length = []; //Apparently this is better than this._alreadyMinimizedWindows = [];
        }
        else {
            for ( let i = 0; i < windows.length; ++i ) {
                if (this._tracker.is_window_interesting(windows[i])){                   
                    if (!windows[i].minimized) {
                        windows[i].minimize();
                    }
                    else {
                        this._alreadyMinimizedWindows.push(windows[i]);
                    }                    
                }
            }
        }
        this._desktopShown = !this._desktopShown;
    }
};

let favorites;
let button;
let windowList;
let appMenu;

function init() {
    button = new ShowDesktopButton();
}

function enable() {	               
        let showdesktop = TOP_BOX;
 
                    if (showdesktop == 'left') {
        let _children = Main.panel._leftBox.get_children();
        Main.panel._leftBox.insert_child_at_index(button.actor, _children.length - 1);
        Main.panel._leftBox.add(button.actor);
                    }  else if (showdesktop == 'left2') {
        Main.panel._leftBox.insert_child_at_index(button.actor, 1);
                    }  else if (showdesktop == 'right') {
        let _children = Main.panel._rightBox.get_children();
        Main.panel._rightBox.insert_child_at_index(button.actor, _children.length);
        Main.panel._rightBox.add(button.actor, 1);
                    } else if (showdesktop == 'center') {
        Main.panel._centerBox.insert_child_at_index(button.actor, 0);
                    } else if (showdesktop == 'center2') {
        Main.panel._centerBox.insert_child_at_index(button.actor, -1);
                    }
}

function disable() {             
        let showdesktop = TOP_BOX;
//        this.button.actor.destroy()
                    if (showdesktop == 'left') {
        Main.panel._leftBox.remove_actor(button.actor);
                    } else if (showdesktop == 'left2') {
        Main.panel._leftBox.remove_actor(button.actor);
                    } else if (showdesktop == 'right') {
        Main.panel._rightBox.remove_actor(button.actor);
                    } else if (showdesktop == 'center') {
        Main.panel._centerBox.remove_actor(button.actor);
                    } else if (showdesktop == 'center2') {
        Main.panel._centerBox.remove_actor(button.actor);
                    }
}
