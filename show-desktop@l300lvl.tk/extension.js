
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

const Gettext = imports.gettext.domain('show-desktop-button');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Keys = Me.imports.keys;

let box;

function ShowDesktopButton(extensionMeta) {
    this._init(extensionMeta);
}

ShowDesktopButton.prototype = {

    _init: function(extensionMeta) {
        this.extensionMeta = extensionMeta;
        this._settings = Convenience.getSettings();
        this.actor = new St.Button({style_class: "desktop", can_focus: true, reactive: true, track_hover: true});
        let icon = new St.Icon();
        this.actor.add_actor(icon);
        this.actor.connect("clicked", Lang.bind(this, this._toggleShowDesktop));
        this._tracker = Shell.WindowTracker.get_default();
        
        this._desktopShown = false;
        
        this._alreadyMinimizedWindows = [];

        this._settingsSignals = [];
        this._settingsSignals.push(this._settings.connect('changed::'+Keys.POSITION, Lang.bind(this, this._setPosition)));
        this.boxPosition = this._settings.get_string(Keys.POSITION);
        if (this.boxPosition == 'tray') {
        box = Main.messageTray.actor;
        } else {
        box = Main.panel["_" + this.boxPosition + "Box"];
        }
    },

    _setPosition: function() {
        let oldPosition = this.boxPosition;
        this.boxPosition = this._settings.get_string(Keys.POSITION);
        if (this.boxPosition == 'tray') {
        let box = Main.messageTray.actor;
        } else {
        let box = Main.panel["_" + oldPosition + "Box"];
        }
        box.remove_actor(button.actor);

        if (this.boxPosition == 'tray') {
        box = Main.messageTray.actor;
        } else {
        box = Main.panel["_" + this.boxPosition + "Box"];
        box.insert_child_at_index(button.actor, 1);
        }
        box.add_actor(button.actor, 0);
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

let button;

function init() {
    button = new ShowDesktopButton();
}

function enable() {	               
        this._settings = Convenience.getSettings();
        let boxPosition = this._settings.get_string(Keys.POSITION);

        if (this.boxPosition == 'tray') {
        box.add_actor(button.actor);
        } else {
        box.insert_child_at_index(button.actor, 1);
        }
}

function disable() {             
        box.remove_actor(button.actor);
}
