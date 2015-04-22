This is my first Gnome Shell Extension.

The idea of this was taken from the MGSE Window List as a proof of concept, and for the fun of learning how js works with Gnome Shell, it has been a great learning curve already.

### TODO:
reimpliment placement options _partially fixed_
impliment icon and better placement options
restore last focused window _done_

### Description: 

Places a button to the left(by default) of the Window List to hide all windows, and the overview if active, and show the current desktop. The visible icon changes when you have toggled hiding/showing of the desktop. Can now be controlled via space/keyboard as well, when hovered, this can be achieved with ctrl/alt/tab/panel/arrows/space or enter. Eventually actual keybinding will happen.

*icon credit madkristoff(thanks, this is _still_ the only icon created and submitted!)* 
credit: madkristoff, jonnius, mbokil, simonthechipmunk, MGSE, erguille, mikechaberski, mathematicalcoffee, asan, spinus, Xes, gcampax, magcius. 

v20. Huge release lots of cleanup, now works with space or enter when hovered, also restores focus to last focused window.
v19: localized thanks to jonnius, icon now toggles modes to indicate status of windows.
v18: stylesheet removed, now uses system style, more cleanup & notations.
v17: placement option returns, left right or center only for now.
v16: skipped, bug on ego caused version jump. ego does not have editting or rebasing options
v15: minimizes and restores only unminimized windows again, added gpl, more cleanup, 18 will fix icon and remove stylesheet probably
v14: lots of cleanup, now an actual button that doesnt break keyboard/panel functionality, and major shoutouts to those that make this possible.

v13: reimplimented entire structure based on shell changes since 3.12, this is now more of an actual button than ever(see wip branch too).
tray gone as it has been practically removed from 3.16, initial 3.12-3.16 support.
patched non-working show desktop function
temporarily disabled placement options

v12: Message Tray option returns, can add to the center of the tray.
*New icon(thanks madkristoff!)* 
Position setting in prefs tool. 
todo: icon setting, add hide overview switch, compat w/show desktop from overview extension.


### 1 click install from E.G.O:

https://extensions.gnome.org/extension/64/show-desktop-button/


### Screenshot

![Screenshot](https://raw.github.com/l300lvl/Show-Desktop-Button/master/screenshot.png)
