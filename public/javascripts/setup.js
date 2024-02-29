// Using an object literal for a jQuery feature
var setup = {
    init: function (settings) {
        setup.config = {
            trigger: $("#database"),
            target: $("#appId"),
            soulbeatAppId: '',
            rhiAppId: '',
            baseDatabase: ''
        };

        // Allow overriding the default config
        $.extend(setup.config, settings);

        setup.mount();
    },

    mount: function () {
        setup.config.trigger.change(setup.showItem);
    },

    showItem: function () {
        let db = $(this).find(":selected").val();
        if (db != 0) {
            setup.config.target.val(db == 1 ? setup.config.rhiAppId : setup.config.soulbeatAppId)
        } else {
            alert('Select database to connect!!!')
            setup.config.trigger.val(setup.config.baseDatabase).change()
        }
    },
};



