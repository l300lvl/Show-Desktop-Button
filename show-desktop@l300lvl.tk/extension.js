/*much various credit to simonthechipmunk, mikechaberski, mathematicalcoffee, asan, spinus, Xes, gcampax, magcius, and every other dev i have burrowed code from over time. without gnu/gpl/foss nothing i code would ever be possible as i just wouldnt bother*/
const St = imports.gi.St;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;

let indicatorBox, icon, _desktopShown, _alreadyMinimizedWindows;

function _showDesktop() {
    if (Main.overview.visible)
    Main.overview.hide();
    let metaWorkspace = global.screen.get_active_workspace();
    let windows = metaWorkspace.list_windows();
    if (_desktopShown) {
        for ( let i = 0; i < windows.length; ++i ) {
            if (windows[i].minimized){
                let shouldrestore = true;
                for (let j = 0; j < _alreadyMinimizedWindows.length; j++) {
                    if (windows[i] == _alreadyMinimizedWindows[j]) {
                        shouldrestore = false;
                        break;
                    }
                }
            if (shouldrestore) {
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
                    windows[i].minimize(global.get_current_time());
                } else {
                    _alreadyMinimizedWindows.push(windows[i]);
                }
            }
        }
    }
    _desktopShown = !_desktopShown;
}

function ShowDesktopButton() {
    indicatorBox = new PanelMenu.Button(0.0);
    icon = new St.Icon({
        style_class: 'system-status-icon' //keep
    });
    indicatorBox.actor.add_actor(icon);
    indicatorBox.actor.add_style_class_name('desktop');
//    icon.has_tooltip = true;
//    indicatorBox.actor.tooltip_text = "show";
    indicatorBox.actor.connect('button-press-event', _showDesktop);
    Main.panel.addToStatusArea("ShowDesktop", indicatorBox, 1, "left");
}

function init(extensionMeta) {
    _desktopShown = false;
    _alreadyMinimizedWindows = [];
//    bits and pieces i may implement or use at some poiunt
//    let theme = imports.gi.Gtk.IconTheme.get_default();
//    theme.append_search_path(extensionMeta.path + "/icons");
//    let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
//    const iconSize = Panel.PANEL_ICON_SIZE * scaleFactor;
//    let appMenu = Main.panel.statusArea.appMenu.actor.get_parent();
//    Main.panel._leftBox.insert_child_below(indicatorBox.actor, appMenu);
//    indicatorBox.reparent(Main.panel.addToStatusArea("ShowDesktop", indicatorBox, 1, "right"));
}

function enable() {
    new ShowDesktopButton();
}

function disable() {
    Main.panel.statusArea['ShowDesktop'] = null;
    indicatorBox.destroy();
    indicatorBox = null;
}

