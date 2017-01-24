
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const WindowManager = imports.ui.windowManager;

let originalHandler;

function init() {
    originalHandler = WindowManager.TouchpadWorkspaceSwitchAction.prototype._handleEvent;
}

function enable() {
	WindowManager.TouchpadWorkspaceSwitchAction.prototype._handleEvent = function(actor, event) {
        if (event.type() != Clutter.EventType.TOUCHPAD_SWIPE)
            return Clutter.EVENT_PROPAGATE;

        if (event.get_gesture_swipe_finger_count() != 3)
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
    };

    var gesture = new WindowManager.TouchpadWorkspaceSwitchAction(global.stage);
    gesture.connect('activated', Lang.bind(Main.wm, Main.wm._actionSwitchWorkspace));
}

function disable() {
    WindowManager.TouchpadWorkspaceSwitchAction.prototype._handleEvent = originalHandler;
}