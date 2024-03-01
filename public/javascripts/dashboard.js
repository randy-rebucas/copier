// Using an object literal for a jQuery feature
var myFeature = {
  init: function (settings) {
    myFeature.config = {
      table: $("#contacts"),
      btnPreview: $(".preview")
    };

    // Allow overriding the default config
    $.extend(myFeature.config, settings);

    $.fn.dataTable.ext.buttons.scrap = {
      text: "Scrap Data",
      className: "btn btn-secondary btn-sm",
      action: function (e, dt, node, config) {
        dt.processing(true);
        let data = dt.rows().data().toArray();
        myFeature.scrap(data, dt);
      },
      init: function (api, node, config) {
        $(node).removeClass("dt-button");
      },
    };

    myFeature.setup();

    setInterval(myFeature.getContactCounts, 60 * 1000);


    $(document).on('click', '.btn-scrap', function () {
      var _self = $(this);
      $.ajax({
        type: "GET",
        url: `/scrap?module=contacts`,
        beforeSend: function () {
          _self.text('Scrapping progress...');
          _self.attr('aria-disabled', true);
          _self.addClass('disabled');
        },
        success: function () {
          _self.text('Done scrapping.');
          _self.attr('aria-disabled', false);
          _self.removeClass('disabled');
          console.log('completes');
        },
      });
    });
  },

  scrap: function (data, dt) {
    // this is already been removed
    $.ajax({
      type: "POST",
      url: `${window.location.origin}/export/transaction`,
      data: {
        module: "contacts",
        data: data,
      },
      success: function (response) {
        dt.processing(false);
        alert(response.mesage);
      },
    });
  },

  getContactCounts: function () {
    $.ajax({
      method: "GET",
      url: '/rest/contacts',
      async: true,
      beforeSend: function () {
        $('.stats').find('h2').text('...');
      },
      success: (response) => {
        let count = response.count;
        $('.stats').find('h2').text(Number(count).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    });
  },

  getUserProfile: function () {
    $.ajax({
      method: "GET",
      url: '/rest/user/profile',
      async: true,
      success: (response) => {
        console.log(response);
        let temp = '';
        temp += '<div class="card">';
        temp += '<div class="card-body p-4">';
        temp += '<div class="text-black">';
        temp += '<div class="align-items-center d-flex flex-shrink-0 justify-content-center">';
        temp += '<img class="img-fluid" src="' + response.logo_url + '" alt="' + response.name + ' " style="border-radius: 10px;"/>';
        temp += '</div>';
        temp += '<div class="">';
        temp += '<h5 class="mb-1">' + response.name + '</h5>';
        temp += '<p class="mb-2" style="color: #2b2a2a;">' + response.email + '</p>';
        temp += '<p class="mb-2" style="color: #2b2a2a;"></p>';
        temp += '<p class="mb-2" style="color: #2b2a2a;">' + response.address.line1 + ' ' + response.address.locality + ', ' + response.address.region + ', ' + response.address.zip_code + '</p>';
        temp += '</div>';
        temp += '</div>';
        temp += '</div>';
        temp += '</div>';

        temp += '<div class="card stats mt-3 text-center">';
        temp += '<div class="card-body">';
        temp += '<h5 class="card-title">Contacts</h5>';
        temp += '<h6 class="card-subtitle">Total Contact to Scrap</h6>';
        temp += '<h2 class="h2">0</h2>';
        temp += '<a href="javascript:;" class="btn btn-primary btn-scrap">Start Scrapping</a>';
        temp += '</div>';
        temp += '</div>';
        $(temp).appendTo($(".widgets"));
      }
    });
  },

  setup: function () {
    myFeature.getUserProfile();
    myFeature.getContactCounts();

    const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });

    const option = {
      responsive: true,
      processing: true,
      paging: true,
      serverSide: true,
      dom:
        "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6 d-flex gap-3 justify-content-end'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      buttons: [
        {
          extend: "scrap",
          // exportOptions: {
          //   rows: function (idx, data, node) {
          //     return data[2] === "London" ? true : false;
          //   },
          // },
        },
      ],
      ajax: {
        url: "/contacts",
      },
      lengthMenu: [
        [50, 100],
        [50, 100],
      ],
      pageLength: 100,
      order: [[0, "asc"]],
      sPaginationType: "full_numbers",
      aoColumns: [
        { mData: "id" },
        { mData: "full_name" },
        { mData: "date_created" },
        { mData: "email" },
        { mData: "phone_number" },
        { mData: "action" },
      ],
      aoColumnDefs: [
        { bSortable: true, aTargets: [1] },
        { bSortable: false, aTargets: [0, 2, 3, 4, 5] },
        { bSearchable: true, aTargets: [1] },
        { bSearchable: false, aTargets: [0, 2, 3, 4, 5] },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.id;
          },
          targets: 0,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return `<div> ${row.full_name} </div>`;
          },
          targets: 1,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            let order_date = new Date(row.date_created);
            return dateFormatter.format(order_date);
          },
          targets: 2,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            let email_addresses = JSON.parse(row.email_addresses);
            return email_addresses.length
              ? email_addresses.map((elem) => elem.email).join(", ")
              : "--";
          },
          targets: 3,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            let phone_numbers = JSON.parse(row.phone_numbers);
            return phone_numbers.length
              ? phone_numbers.map((elem) => elem.number).join(", ")
              : "--";
          },
          targets: 4,
        },
        {
          render: function (data, type, row) {
            return (
              '<a href="#" data-id="' +
              row["id"] +
              '" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">preview</a>'
            );
          },
          targets: 5,
          className: "preview",
        },
      ],
    };
    myFeature.config.table.DataTable(option);

    myFeature.config.table.on("click", "tbody tr td.preview", function () {
      let id = $(this).find("a").attr("data-id");
      $.ajax({
        type: "GET",
        url: `${window.location.origin}/contacts/${id}`,
        success: function (response) {
          let modal = $("body .modal");
          modal
            .find(".modal-title")
            .text(`${response.given_name} ${response.family_name}`);

          let modalTemplate = `<p>created: ${response.date_created}</p>`;
          modalTemplate += `<h5>Addresses</h5>`;
          let addresses = response.addresses;
          console.log(addresses);
          if (addresses.length) {
            addresses.forEach((address) => {
              modalTemplate += `<address>${address.line1} ${address.locality} ${address.region}</address>`;
            });
          } else {
            modalTemplate += `<address>--</address>`;
          }

          $(".modal-body").html(modalTemplate);

          $("#myModal").modal("show");
        },
      });
    });
  },
};

$(document).ready(myFeature.init);
