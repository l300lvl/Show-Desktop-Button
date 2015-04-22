/*much various credit to simonthechipmunk, mikechaberski, mathematicalcoffee, asan, spinus, Xes, gcampax, magcius, and every other dev i have burrowed code from over time. without gnu/gpl/foss nothing i code would ever be possible as i just wouldnt bother*/
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Keys = Me.imports.keys;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const Atk = imports.gi.Atk;
const Clutter = imports.gi.Clutter;
const CtrlAltTab = imports.ui.ctrlAltTab;

let indicatorBox, icon, _desktopShown, _alreadyMinimizedWindows, box, _settings, binButton, baseGIcon, hoverGIcon, buttonIcon, shouldrestore;

    //get currently focused window this was pulled from https://github.com/mathematicalcoffee/Gnome-Shell-Window-Buttons-Extension
function _getWindowToControl () {
    let win = global.display.focus_window,
    workspace = global.screen.get_active_workspace(),
    windows = workspace.list_windows().filter(function (w) {
        return w.get_window_type() !== Meta.WindowType.DESKTOP;
    });
    // BAH: list_windows() doesn't return in stackin order (I thought it did)
    windows = global.display.sort_windows_by_stacking(windows);

    if (win === null || win.get_window_type() === Meta.WindowType.DESKTOP) {
        // No windows are active, control the uppermost window on the
        // current workspace
        if (windows.length) {
            win = windows[windows.length - 1];
            if(!('get_maximized' in win)) {
                win = win.get_meta_window();
            }
        }
    }
    return win;
}
    //toggles the desktop and icon when clicked
function _showDesktop() {
    let metaWorkspace = global.screen.get_active_workspace();
    let windows = metaWorkspace.list_windows();

    if (_desktopShown) {
        for ( let i = 0; i < windows.length; ++i ) {
            if (windows[i].minimized){
                shouldrestore = true;
                for (let j = 0; j < _alreadyMinimizedWindows.length; j++) {
                    if (windows[i] == _alreadyMinimizedWindows[j]) {
                        shouldrestore = false;
                        break;
                    }
                }
            if (shouldrestore) {
                //toggle icon to the opposite settings when windows are minimized
                icon.set_gicon(baseGIcon);
                binButton.connect('enter-event', function() {
                    _SetButtonIcon('hover');
                });
                binButton.connect('leave-event', function() {
                    _SetButtonIcon('base');
                });
                //only check and hide overview when button clicked durp durp
                if (Main.overview.visible) {
                    Main.overview.hide();
                }
                windows[i].unminimize(global.get_current_time());
                //activate and bring the last focused window to the top
                let win = _getWindowToControl();
                //let tracker = Shell.WindowTracker.get_default();
                let focusedApp = tracker.focus_app;
                win.activate(global.get_current_time());
              //  tracker.connect('notify::focus-app', win);
            }
        }
    }
    _alreadyMinimizedWindows.length = []; //Apparently this is better than this._alreadyMinimizedWindows = [];
    } else {
        for ( let i = 0; i < windows.length; ++i ) {
            if (!windows[i].skip_taskbar){
                if (!windows[i].minimized) {
                    //set dfault hover icon when no windows minimized
                    icon.set_gicon(hoverGIcon);
                    binButton.connect('enter-event', function() {
                        _SetButtonIcon('base');
                    });
                    binButton.connect('leave-event', function() {
                        _SetButtonIcon('hover');
                    });
                    //only check and hide overview when button clicked durp durp
                    if (Main.overview.visible) {
                        Main.overview.hide();
                    }
                    windows[i].minimize(global.get_current_time());
                } else {
                    _alreadyMinimizedWindows.push(windows[i]);
                }
            }
        }
    }
    _desktopShown = !_desktopShown;
}
    //creates the button and sets the icon and mouse event connections finally adding everything to status area
function ShowDesktopButton() {
    this._settingsSignals = [];
    this._settingsSignals.push(_settings.connect('changed::' + Keys.POSITION, _setPosition));
    //get current panel box position this also needs help
    this.boxPosition = _settings.get_string(Keys.POSITION);
    box = this.boxPosition;
    //create initial panel button
    indicatorBox = new PanelMenu.Button(0.0, null, true);
    indicatorBox.actor.accessible_role = Atk.Role.TOGGLE_BUTTON;
    //create layout we are trying to do some fanciness here which doesn't seem right
    binButton = new St.BoxLayout({ style_class: 'panel-status-menu-box',
                reactive: true,
                can_focus: true,
                track_hover: true });
    //use gio for hover icons and move away from stylesheet _finally_
    baseGIcon = Gio.icon_new_for_string('my-show-desktop');
    hoverGIcon = Gio.icon_new_for_string('my-show-desktop-hover');
    //create initial base icon with system stylesheet
    icon = new St.Icon({
        'gicon': Gio.icon_new_for_string('my-show-desktop'),
        style_class: 'system-status-icon' //sets st icon to system style
    });
    //add st.icon to st.layout
    binButton.add_child(icon, {
        style_class: 'system-status-icon' //sets st icon to system style
    });
    //add st.layout to panel button errrr
    indicatorBox.actor.add_actor(binButton);
    //sets key release event when icon is hovered via alt tab or selecting an item in panel
    indicatorBox.actor.connect_after('key-release-event', _onKeyRelease);
    //sets state when button toggled to notify panel this is in use
    indicatorBox.connect('showing', function() {
        binButton.add_accessible_state (Atk.StateType.CHECKED);
    });
    indicatorBox.connect('hiding', function() {
        binButton.remove_accessible_state (Atk.StateType.CHECKED);
    });
    //calls the function to toggle desktop when clicked now works when click is released
    binButton.connect('button-release-event', _showDesktop);
    //set icon on mouse over
    binButton.connect('enter-event', function() {
        _SetButtonIcon('hover');
    });
    //changes the icon back to base when the cursor is no longer hovering
    binButton.connect('leave-event', function() {
        _SetButtonIcon('base');
    });
    //finally add panel button to statusArea
    Main.panel.addToStatusArea("ShowDesktop", indicatorBox, 1, box);
}
    //from panel.js sets keys to toggle showDesktop the same as those for activities button
    //this may change again so must keep an eye on panel.js
function _onKeyRelease(actor, event) {
    let symbol = event.get_key_symbol();
    if (symbol == Clutter.KEY_Return || symbol == Clutter.KEY_space) {
        _showDesktop();
    }
    return Clutter.EVENT_PROPAGATE;
}
    //hover icon function dirty, each mode can be set explicitly but for now this works
function _SetButtonIcon(mode) {
    if (mode === 'hover') {
        icon.set_gicon(hoverGIcon);
    } else {
        icon.set_gicon(baseGIcon);
    }
}
    //sets the panel position to left right or center when called, this needs work
function _setPosition() {
    let oldPosition = this.boxPosition;
    this.boxPosition = _settings.get_string(Keys.POSITION);
    let box = oldPosition;
    //check that indicatorBox is present, or settings will throw error when extension disabled
    if (indicatorBox !== null) {
        disable();
        enable();
    }
}

function init(extensionMeta) {
    //sets initial desktop status
    _desktopShown = false;
    //creates windows we have minimized variable
    _alreadyMinimizedWindows = [];
    _settings = Convenience.getSettings();
    //get icon path as gio wasnt being called correctly
    Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path());
//    bits im slowly reimplementing
//    let appMenu = Main.panel.statusArea.appMenu.actor.get_parent();
//    Main.panel._leftBox.insert_child_below(indicatorBox.actor, appMenu);
}

function enable() {
    new ShowDesktopButton();
}

function disable() {
    //null out status role so this role can be used again
    Main.panel.statusArea['ShowDesktop'] = null;
    indicatorBox.destroy();
    indicatorBox = null;
}

