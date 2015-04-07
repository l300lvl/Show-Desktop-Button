/*much various credit to madkristoff, mbokil, simonthechipmunk, MGSE, erguille, mikechaberski, mathematicalcoffee, asan, spinus, Xes, gcampax, magcius, and every other dev i have burrowed code from over time. without gnu/gpl/foss nothing i code would ever be possible as i just wouldnt bother*/
const St = imports.gi.St;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;

let text, indicatorBox, icon;

function _showDesktop() {
        this._alreadyMinimizedWindows = [];
        if (Main.overview.visible)
        Main.overview.hide();
        let metaWorkspace = global.screen.get_active_workspace();
        let windows = metaWorkspace.list_windows();
        if (this._desktopShown) {
            for ( let i = 0; i < windows.length; ++i ) {
                if (windows[i].minimized){
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
                if (!windows[i].skip_taskbar){
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

function ShowDesktopButton() {
    indicatorBox = new PanelMenu.Button(0.0);
    icon = new St.Icon({
        style_class: 'system-status-icon' //keep
    });
    indicatorBox.actor.add_actor(icon);
    indicatorBox.actor.add_style_class_name('desktop');
    indicatorBox.actor.connect('button-press-event', _showDesktop);
    Main.panel.addToStatusArea("ShowDesktop", indicatorBox, 1, "left");
}

function init(extensionMeta) {
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

