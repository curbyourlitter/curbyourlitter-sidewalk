export var PopoverButton = {
    getInitialState: function () {
        return {
            popoverShown: true
        };
    },

    dismissPopover: function (e) {
        this.setState({ popoverShown: false });
        e.preventDefault();
    }
};

export default PopoverButton;
