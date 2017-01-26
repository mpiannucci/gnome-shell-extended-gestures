const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtendedGesturesSettingsWidget = new GObject.Class({
    Name: 'ExtendedGestures.prefs.ExtendedGesturesSettingsWidget',
    GTypeName: 'ExtendedGesturesSettingsWidget',
    Extends: Gtk.Grid,

    _init: function(params) {
        this.parent(params);
        this.row_spacing = 6;
        this.column_spacing = 6;
        this.margin_left = 6;
        this.margin_right = 6;
        this.margin_top = 6;
        this.margin_bottom = 6;
        this.orientation = Gtk.Orientation.VERTICAL;

        this._horizontalSwitchLabel = new Gtk.Label ({label: "Horizontal Swipes"});
        this.add(this._horizontalSwitchLabel);

        this._horizontalSwitch = new Gtk.Switch ({active: true});
        this.attach_next_to(this._horizontalSwitch, this._horizontalSwitchLabel, Gtk.PositionType.RIGHT, 1, 1);

        this._horizontalLabel = new Gtk.Label ({label: "Action"});
        this.add(this._horizontalLabel);

        // Create the combobox
        this._horizontalActionCombo = new Gtk.ComboBoxText();
        let actions = ["Toggle Overview", "Cycle Applications"];
        for (let i = 0; i < actions.length; i++)
            this._horizontalActionCombo.append_text (actions[i]);
        this._horizontalActionCombo.set_active (0);
        this.attach_next_to(this._horizontalActionCombo, this._horizontalLabel, Gtk.PositionType.RIGHT, 1, 1);
    }
});

function init() {

}

function buildPrefsWidget() {
    let settingsWidget = new ExtendedGesturesSettingsWidget();
    settingsWidget.show_all();
    return settingsWidget;
}