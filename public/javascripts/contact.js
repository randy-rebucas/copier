// Using an object literal for a jQuery feature
var myFeature = {
  init: function (settings) {
    myFeature.config = {
      table: $("#contacts"),
      btnPreview: $(".preview"),
    };

    // Allow overriding the default config
    $.extend(myFeature.config, settings);

    var modalLayout = `<div class="modal fade" id="myModal" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Modal with Dynamic Content</h4>
                </div>
                <div class="modal-body">

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>`; // Create element with HTML

    // $("body").append(modalLayout);

    // Custom DataTable Button
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

  setup: function () {
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
        url: "/contacts/all",
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
        { mData: "family_name" },
        { mData: "company" },
        { mData: "date_created" },
        { mData: "email" },
        { mData: "phone_number" },
        { mData: "action" },
      ],
      aoColumnDefs: [
        { bSortable: true, aTargets: [0] },
        { bSortable: false, aTargets: [1, 2, 3, 4, 5, 6] },
        { bSearchable: true, aTargets: [1] },
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
            let family_name = row.family_name;
            let given_name = row.given_name != null ? row.given_name : '--';
            return family_name.concat(', ', given_name);
          },
          targets: 1,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.company ? row.company.company_name : '--';
          },
          targets: 2,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            let order_date = new Date(row.date_created);
            return dateFormatter.format(order_date);
          },
          targets: 3,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.email_addresses.length
              ? row.email_addresses.map((elem) => elem.email).join(", ")
              : "--";
          },
          targets: 4,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.phone_numbers.length
              ? row.phone_numbers.map((elem) => elem.number).join(", ")
              : "--";
          },
          targets: 5,
        },
        {
          render: function (data, type, row) {
            return (
              '<a href="#" data-id="' +
              row["id"] +
              '" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">preview</a>'
            );
          },
          targets: 6,
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

          // Display Modal
          $("#myModal").modal("show");
        },
      });
    });
  },
};

$(document).ready(myFeature.init);
