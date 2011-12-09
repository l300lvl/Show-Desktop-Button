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

//const PANEL_ICON_SIZE = 24;
//const SPINNER_ANIMATION_TIME = 1;

function ShowDesktopButton() {
    this._init();
}

ShowDesktopButton.prototype = {
//    __proto__ : ShowDesktopButton.prototype,

    _init: function() {
        this.actor = new St.Button();
        let icon = new St.Icon({icon_name: "desktop", icon_size: 24, icon_type: St.IconType.FULLCOLOR});             
        this.actor.add_actor(icon);
        
        this.actor.connect("clicked", Lang.bind(this, this._toggleShowDesktop));
        
        this._tracker = Shell.WindowTracker.get_default();
        
        this._desktopShown = false;
        
        this._alreadyMinimizedWindows = [];
    },
      
    _toggleShowDesktop: function() {
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

//let button;
//let windowList;
//let bottomPosition;
//let appMenu;

function init() {
    button = new ShowDesktopButton();
    // Find out if the bottom panel extension is enabled    
    let settings = new Gio.Settings({ schema: 'org.gnome.shell' });
//    let enabled_extensions = settings.get_strv('enabled-extensions');
}

function enable() {	               
    // Create a show desktop button   
    //Main.panel._leftBox.add(button.actor, { x_fill: true, y_fill: true });
    Main.panel._leftBox.insert_actor(button.actor, 1);
}

function disable() {             
    Main.panel._leftBox.remove_actor(button.actor);
}
