const Clutter = imports.gi.Clutter;
const Config = imports.misc.config;
const Lang = imports.lang;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Signals = imports.signals;
const Utils = imports.misc.extensionUtils;

const Gettext = imports.gettext.domain('extendedgestures');
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

// Our custom gesture handler instance
let gestureHandler = null;

// Our settings
let schema = null;

// Compatability settings
let versionSmaller330 = Utils.versionCheck(["3.26", "3.28"], Config.PACKAGE_VERSION);

function init() {
    schema = Convenience.getSettings();
}

const TouchpadGestureAction = new Lang.Class({
    Name: 'TouchpadGestureAction',

    _init: function(actor) {
        this._dx = 0;
        this._dy = 0;

        this._updateSettings();

        this._gestureCallbackID = actor.connect('captured-event', Lang.bind(this, this._handleEvent));
        this._actionCallbackID = this.connect('activated', Lang.bind (this, this._doAction));
        this._updateSettingsCallbackID = schema.connect('changed', Lang.bind(this, this._updateSettings));
    },

    _checkActivated: function(fingerCount) {
        const DIRECTION_LOOKUP = {
            0: Meta.MotionDirection.RIGHT,
            1: Meta.MotionDirection.UP,
            2: Meta.MotionDirection.LEFT,
            3: Meta.MotionDirection.DOWN
        };

        let magnitude = Math.sqrt(Math.pow(this._dy, 2) + Math.pow(this._dx, 2));

        let allowedModes = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW;

        if ((allowedModes & Main.actionMode) == 0)
            return;

        let rounded_direction = Math.round(Math.atan2(this._dy, this._dx) / Math.PI * 2);
        if (rounded_direction == -1) {
            rounded_direction = 3;
        } else if (rounded_direction == -2) {
            rounded_direction = 2;
        }
        let dir = DIRECTION_LOOKUP[rounded_direction]

        if (!this._checkSwipeValid(dir, fingerCount, magnitude))
            return;

        this.emit('activated', dir, fingerCount);
    },

    _handleEvent: function(actor, event) {
        if (event.type() != Clutter.EventType.TOUCHPAD_SWIPE)
            return Clutter.EVENT_PROPAGATE;

        if (event.get_touchpad_gesture_finger_count() != 3)
            return Clutter.EVENT_PROPAGATE;

        if (event.get_gesture_phase() == Clutter.TouchpadGesturePhase.UPDATE) {
            let [dx, dy] = event.get_gesture_motion_delta();

            this._dx += dx;
            this._dy += dy;
        } else {
            if (event.get_gesture_phase() == Clutter.TouchpadGesturePhase.END)
                this._checkActivated(event.get_touchpad_gesture_finger_count());

            this._dx = 0;
            this._dy = 0;
        }

        return Clutter.EVENT_STOP;
    },

    _doAction: function (sender, dir, fingerCount) {
        let action = null;

        if (fingerCount == 3) {
            switch (dir) {
                case Meta.MotionDirection.LEFT:
                    action = this._leftThreeAction;
                    break;
                case Meta.MotionDirection.RIGHT:
                    action = this._rightThreeAction;
                    break;
                case Meta.MotionDirection.UP:
                    action = this._upThreeAction;
                    break;
                case Meta.MotionDirection.DOWN:
                    action = this._downThreeAction;
                    break;
                default:
                    break;
            }
        }

        if (action == null) {
            return;
        }

        switch (action) {
            case 0:
                Main.overview.toggle();
                break;
            case 1:
                Main.wm._switchApp();
                break;
            case 2:
                Main.overview.toggle();
                if (Main.overview._shown)
                    Main.overview.viewSelector._toggleAppsPage();
                break;
            case 3:
                if (dir == Meta.MotionDirection.LEFT) {
                    dir = Meta.MotionDirection.UP;
                } else if (dir == Meta.MotionDirection.RIGHT) {
                    dir = Meta.MotionDirection.DOWN;
                }
                this._switchWorkspace(sender, dir);
                break;
            case 4:
                const minimizedWindows = [];
                // gnome-shell >= 3.30 use workspace_manager instead of screen
                const activeWorkspace = versionSmaller330?
                    global.screen.get_active_workspace():global.workspace_manager.get_active_workspace();
                // loop through workspace windows
                Main.layoutManager._getWindowActorsForWorkspace(activeWorkspace).forEach( windowActor => {
                    const metaWindow = windowActor.get_meta_window();
                    // avoid minimizing always on top windows (Nautilus desktop and gnome shell for example)
                    if ( !metaWindow.is_on_all_workspaces() && metaWindow.showing_on_its_workspace()) {
                        minimizedWindows.push(metaWindow);
                        metaWindow.minimize();
                    }
                });
                //stash windows or restore previous stash
                if (minimizedWindows.length > 0) {
                    activeWorkspace.stashedWindows = minimizedWindows;
                } else if (activeWorkspace.stashedWindows != null) {
                    activeWorkspace.stashedWindows.forEach( window => window.activate(window));
                }
                break;
            case 5:
                // Nothing
                break;
            case 6:
                this._switchWorkspace(sender, Meta.MotionDirection.UP);
                break;
            case 7:
                this._switchWorkspace(sender, Meta.MotionDirection.DOWN);
                break;
            case 8:
                this._switchToLastApp();
                break;
            default:
                break;
        }
    },

    _switchWorkspace: function (sender, dir) {
        // fix for gnome-shell >= 3.30
        if (!versionSmaller330) {
            let workspaceManager = global.workspace_manager;
            let activeWorkspace = workspaceManager.get_active_workspace();
            Main.wm._prepareWorkspaceSwitch(activeWorkspace.index(), -1);
        }
        Main.wm._actionSwitchWorkspace(sender, dir);
    },

    _switchToLastApp() {
        let windows = global.get_window_actors().filter(actor => {
            let win = actor.metaWindow;
            // gnome-shell >= 3.30 use workspace_manager instead of screen
            const activeWorkspace = versionSmaller330?
                global.screen.get_active_workspace():global.workspace_manager.get_active_workspace();
            return (!win.is_override_redirect() &&
                    win.located_on_workspace(activeWorkspace));
        });
        if (windows.length == 0)
            return;
        let focusWindow = global.display.focus_window;
        let nextWindow;
        if (focusWindow == null)
            nextWindow = windows[0].metaWindow;
        else {
            let index = Main.wm._lookupIndex (windows, focusWindow) - 1;
            if (index < 0)
                index = windows.length - 1;
            nextWindow = windows[index].metaWindow;
        }
        Main.activateWindow(nextWindow);
    },

    _checkSwipeValid: function (dir, fingerCount, motion) {
        const MOTION_THRESHOLD = 50;

        if (fingerCount == 3) {
            switch (dir) {
                case Meta.MotionDirection.LEFT:
                    return this._leftThreeEnabled && (motion > (50 - this._horizontalSensitivityAdjustment));
                case Meta.MotionDirection.RIGHT:
                    return this._rightThreeEnabled && (motion > (50 - this._horizontalSensitivityAdjustment));
                case Meta.MotionDirection.UP:
                    return this._upThreeEnabled && (motion > (50 - this._verticalSensitivityAdjustment));
                case Meta.MotionDirection.DOWN:
                    return this._downThreeEnabled && (motion > (50 - this._verticalSensitivityAdjustment));
                default:
                    break;
            }
        }

        return false;
    },

    _updateSettings: function () {
        this._leftThreeEnabled = schema.get_boolean('left-three-swipes');
        this._leftThreeAction = schema.get_enum('left-three-action');
        this._rightThreeEnabled = schema.get_boolean('right-three-swipes');
        this._rightThreeAction = schema.get_enum('right-three-action');
        this._upThreeEnabled = schema.get_boolean('up-three-swipes');
        this._upThreeAction = schema.get_enum('up-three-action');
        this._downThreeEnabled = schema.get_boolean('down-three-swipes');
        this._downThreeAction = schema.get_enum('down-three-action');
        this._verticalSensitivityAdjustment = schema.get_int('vertical-sensitivity-adjustment');
        this._horizontalSensitivityAdjustment = schema.get_int('horizontal-sensitivity-adjustment');
    },

    _cleanup: function() {
        global.stage.disconnect(this._gestureCallbackID);
        this.disconnect(this._actionCallbackID);
        schema.disconnect(this._updateSettingsCallbackID);
    }
});

function enable() {
    Signals.addSignalMethods(TouchpadGestureAction.prototype);
    gestureHandler = new TouchpadGestureAction(global.stage);
}

function disable() {
    gestureHandler._cleanup();
    Main.wm._workspaceTracker._workspaces.forEach( ws => {
        delete ws.stashedWindows;
    });
}
