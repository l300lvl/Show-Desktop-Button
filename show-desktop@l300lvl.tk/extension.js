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
//needed for hiding mouse over tooltip
const Tweener = imports.ui.tweener;
let indicatorBox, icon, _desktopShown, _alreadyMinimizedWindows, box, _settings, binButton, baseGIcon, hoverGIcon, buttonIcon, shouldrestore, focus;
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
                        //activeWindow = global.display.focus_window.pop();
                        //Main.activateWindow(activeWindow); //need to get LAST focused window somehow _shrugs_
                        //maybe steal from mints meta patches again i shrug at this
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
                  //  binButton.connect('enter-event', function() {
                   //     _showTitle('show');
                        
                   // });
                    binButton.connect('leave-event', function() {
                        _SetButtonIcon('hover');
                        
                    });
                    //only check and hide overview when button clicked durp durp
                    if (Main.overview.visible) {
                    Main.overview.hide();
                    }
                    //global.screen.get_active_workspace.list_windows.has_focus;
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
    indicatorBox = new PanelMenu.Button({ style_class: 'panel-status-button',
                reactive: true,
                can_focus: true,
                x_fill: true,
                y_fill: false,
                track_hover: true });
    //create st.bin we are trying to do some fanciness here which doesn't seem right maybe st layout would be better
    binButton = new St.Bin({ style_class: 'panel-button',
                reactive: true,
                can_focus: true,
                x_fill: true,
                y_fill: false,
                track_hover: true });
    //use gio for hover icons and move away from stylesheet _finally_
    baseGIcon = Gio.icon_new_for_string('my-show-desktop');
    hoverGIcon = Gio.icon_new_for_string('my-show-desktop-hover');
    //create initial base icon with system stylesheet
    icon = new St.Icon({
        'gicon': Gio.icon_new_for_string('my-show-desktop'),
        style_class: 'system-status-icon' //sets st icon to system style
    });
    //add st.icon to st.bin
    binButton.set_child(icon);
    //add st.bin to panel button
    indicatorBox.actor.add_actor(binButton);
    //calls the function to toggle desktop when clicked im looking for a keybinding of some sort here too
    binButton.connect('button-press-event', _showDesktop);
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
    //hover icon function, each mode can be set explicitly but for now this works
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
//    let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
//    const iconSize = Panel.PANEL_ICON_SIZE * scaleFactor;
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

