const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Signals = imports.signals;

const Gettext = imports.gettext.domain('extendedgestures');
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

// Our custom gesture handler instance
let gestureHandler = null;

// Our settings
let schema = null;

function init() {
    schema = Convenience.getSettings();
}

const TouchpadGestureAction = new Lang.Class({
    Name: 'TouchpadGestureAction',

    _init: function(actor) {
        this._dx = 0;
        this._dy = 0;
        //this.horizontalEnabled = schema.get_boolean('horizontal-swipes');
        //this.horizontalAction = schema.get_enum('horizontal-action');
        this.horizontalEnabled = true;
        this.horizontalAction = 0;

        this._gestureCallbackID = actor.connect('captured-event', Lang.bind(this, this._handleEvent));
        this._actionCallbackID = this.connect('activated', Lang.bind (this, this._doAction));
        //this._horizontalEnabledCallbackID = schema.connect('changed', Lang.bind(this, this._horizontalEnabledSettingChanged));
        //this._horizontalActionCallbackID = schema.connect('changed', Lang.bind(this, this._horizontalActionSettingChanged));
    },

    _checkActivated: function() {
        const MOTION_THRESHOLD = 50;
        let allowedModes = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW;
        let dir;

        if ((allowedModes & Main.actionMode) == 0)
            return;

        if (this._dy < -MOTION_THRESHOLD)
            dir = Meta.MotionDirection.DOWN;
        else if (this._dy > MOTION_THRESHOLD)
            dir = Meta.MotionDirection.UP;
        else if (this._dx < -MOTION_THRESHOLD)
            dir = Meta.MotionDirection.RIGHT;
        else if (this._dx > MOTION_THRESHOLD)
            dir = Meta.MotionDirection.LEFT;
        else
            return;

        if (!this._checkSwipeValid(dir))
            return;

        this.emit('activated', dir);
    },

    _handleEvent: function(actor, event) {
        if (event.type() != Clutter.EventType.TOUCHPAD_SWIPE)
            return Clutter.EVENT_PROPAGATE;

        if (event.get_gesture_swipe_finger_count() < 3)
            return Clutter.EVENT_PROPAGATE;

        if (event.get_gesture_phase() == Clutter.TouchpadGesturePhase.UPDATE) {
            let [dx, dy] = event.get_gesture_motion_delta(event);

            this._dx += dx;
            this._dy += dy;
        } else {
            if (event.get_gesture_phase() == Clutter.TouchpadGesturePhase.END)
                this._checkActivated();

            this._dx = 0;
            this._dy = 0;
        }

        return Clutter.EVENT_STOP;
    },

    _doAction: function (sender, dir) {
        if (this._isSwipeHorizontal(dir)) {
            switch (this.horizontalAction) {
                case 0:
                    Main.overview.toggle();
                    break;
                case 1:
                    this._switchApp(dir);
                    break;
                case 2:
                    Main.overview.toggle(); 
                    if (Main.overview._shown) 
                        Main.overview.viewSelector._toggleAppsPage();
                    break;
                case 3:
                    if (dir == Meta.MotionDirection.LEFT) {
                        dir = Meta.MotionDirection.UP;
                    } else {
                        dir = Meta.MotionDirection.DOWN;
                    }
                    Main.wm._actionSwitchWorkspace(sender, dir);
                    break;
                default:
                    break;
            }
        } else {
            Main.wm._actionSwitchWorkspace(sender, dir);
        }
    },

    _checkSwipeValid: function (dir) {
        if (!this.horizontalEnabled && this._isSwipeHorizontal(dir))
            return false;
        return true;
    },

    _isSwipeHorizontal: function (dir) {
        return dir == Meta.MotionDirection.LEFT || dir == Meta.MotionDirection.RIGHT;
    },

    _horizontalEnabledSettingChanged: function () {
        //this.horizontalEnabled = schema.get_boolean('horizontal-swipes');
    },

    _horizontalActionSettingChanged: function () {
        //this.horizontalAction = schema.get_enum('horizontal-action');
    },

    _switchApp: function (dir) {
        let windows = global.get_window_actors().filter(Lang.bind(Main.wm, function(actor) {
            let win = actor.metaWindow;
            return (!win.is_override_redirect() &&
                    win.located_on_workspace(global.screen.get_active_workspace()));
        }));

        if (windows.length == 0)
            return;

        let focusWindow = global.display.focus_window;
        let nextWindow;

        if (focusWindow == null)
            nextWindow = windows[0].metaWindow;
        else {
            let index = 0;

            if (dir == Meta.MotionDirection.RIGHT)
                index = Main.wm._lookupIndex (windows, focusWindow) + 1;
            else 
                index = Main.wm._lookupIndex (windows, focusWindow) - 1;

            global.log(index);
            if (index >= windows.length || index < 0)
                index = 0;

            nextWindow = windows[index].metaWindow;
        }

        Main.activateWindow(nextWindow);
    },

    _cleanup: function() {
        global.stage.disconnect(this._gestureCallbackID);
        this.disconnect(this._actionCallbackID);
        schema.disconnect(this._horizontalEnabledCallbackID);
        schema.disconnect(this._horizontalActionCallbackID);
    }
});

function enable() {
    Signals.addSignalMethods(TouchpadGestureAction.prototype);
    gestureHandler = new TouchpadGestureAction(global.stage);
}

function disable() {
    gestureHandler._cleanup();
}