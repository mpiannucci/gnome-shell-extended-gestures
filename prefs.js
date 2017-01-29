const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('extendedgestures');
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

let schema = null;

function init() {
    schema = Convenience.getSettings();
}

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

        this._horizontalSwitch = new Gtk.Switch ({active: schema.get_boolean ('horizontal-swipes')});
        this._horizontalSwitch.connect('notify::active', Lang.bind (this, this._horizontalSwitchFlip));
        this.attach_next_to(this._horizontalSwitch, this._horizontalSwitchLabel, Gtk.PositionType.RIGHT, 1, 1);

        this._horizontalLabel = new Gtk.Label ({label: "Action"});
        this.add(this._horizontalLabel);

        // Create the combobox
        this._horizontalActionCombo = new Gtk.ComboBoxText();
        let actions = ['Toggle Overview', 'Cycle Applications', 'Show App Drawer', 'Switch Workspace'];
        for (let i = 0; i < actions.length; i++)
            this._horizontalActionCombo.append_text (actions[i]);
        this._horizontalActionCombo.set_active (schema.get_enum('horizontal-action'));
        this._horizontalActionCombo.connect ('changed', Lang.bind (this, this._horizontalActionChanged));
        this.attach_next_to(this._horizontalActionCombo, this._horizontalLabel, Gtk.PositionType.RIGHT, 1, 1);
    },

    _horizontalSwitchFlip: function() {
        schema.set_boolean ('horizontal-swipes', this._horizontalSwitch.get_active());
    }, 

    _horizontalActionChanged: function() {
        schema.set_enum ('horizontal-action', this._horizontalActionCombo.get_active());
    }
});

function buildPrefsWidget() {
    let settingsWidget = new ExtendedGesturesSettingsWidget();
    settingsWidget.show_all();
    return settingsWidget;
}