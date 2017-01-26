
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Signals = imports.signals;
const WindowManager = imports.ui.windowManager;

let originalHandler = null;
let gestureHandler = null;
let gestureCallbackID = null;

const TouchpadGestureAction = new Lang.Class({
    Name: 'TouchpadGestureAction',

    _init: function(actor) {
        this._dx = 0;
        this._dy = 0;
        this.gestureCallbackID = actor.connect('captured-event', Lang.bind(this, this._handleEvent));
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

    _cleanup: function() {
        global.stage.disconnect(this.gestureCallbackID);
    }
});

function init() {
}

function enable() {

    Main.wm._handleTouchpadGesture = function(action, direction) {
        if (direction == Meta.MotionDirection.DOWN || direction == Meta.MotionDirection.UP) {
            Main.wm._actionSwitchWorkspace(action, direction);
        } else {
            Main.overview.toggle();
            //Main.wm._switchApp();
        }
    };

    Signals.addSignalMethods(TouchpadGestureAction.prototype);
    gestureHandler = new TouchpadGestureAction(global.stage);
    gestureCallbackID = gestureHandler.connect('activated', Lang.bind(Main.wm, Main.wm._handleTouchpadGesture));
}

function disable() {
    // Disconnect our signal and delete the handler
    gestureHandler.disconnect(gestureCallbackID);
    gestureHandler._cleanup();
    delete Main.wm._handleTouchpadGesture;
}