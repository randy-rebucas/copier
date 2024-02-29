// Using an object literal for a jQuery feature
var myFeature = {
  init: function (settings) {
    myFeature.config = {
      table: $("#contacts-tbl")
    };

    // Allow overriding the default config
    $.extend(myFeature.config, settings);

    myFeature.setup();

    setInterval(myFeature.getContactCounts, 60 * 1000);
  },

  getContactCounts: function () {
    $.ajax({
      method: "GET",
      url: '/rest/contacts',
      async: true,
      beforeSend: function () {
        $('.card-body p').text('Loading...');
      },
      success: (response) => {
        let count = response.count;
        console.log(count);
        $('.card-body p').text(`Total Contacts: ${Number(count).toLocaleString('en', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`);
      }
    });
  },

  getUserProfile: function () {

    $.ajax({
      method: "GET",
      url: '/rest/user/profile',
      async: true,
      beforeSend: function () {
        // $('.card-body p').text('Loading...');
      },
      success: (response) => {
        console.log(response);
        <div class="card" style="border-radius: 15px">
          <div class="card-body p-4">
            <div class="d-flex text-black">
              <div class="align-items-center d-flex flex-shrink-0">
                <img class="img-fluid" src="https://d1yoaun8syyxxt.cloudfront.net/bl326-87bd7a0a-c714-4530-af48-2e2e6c279bf4-v2" alt="Regan Hillyer Int " style="width: 180px; border-radius: 10px;"/>
              </div>
              <div class="flex-grow-1 ms-3">
                <h5 class="mb-1">Regan Hillyer Int </h5>
                <p class="mb-2 pb-1" style="color: #2b2a2a;">support@reganhillyer.com</p>
                <p class="mb-2 pb-1" style="color: #2b2a2a;"></p>
                <p class="mb-2 pb-1" style="color: #2b2a2a;">Unit 5, 17 Helen Street  Heidelberg West Victoria 3081</p>
              </div>
            </div>
          </div>
        </div>
        // let count = response.count;
        // $('.card-body p').text(`Total Contacts: ${Number(count).toLocaleString('en', {
        //   minimumFractionDigits: 2,
        //   maximumFractionDigits: 2
        // })}`);
      }
    });
  },

  setup: function () {
    // myFeature.getUserProfile();
    myFeature.getContactCounts();

    const option = {
      responsive: true,
      processing: true,
      paging: true,
      serverSide: true,
      dom:
        "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6'p>>",
      ajax: {
        url: "/contacts/exported",
      },
      lengthMenu: [
        [10, 20, 30, 40, 50],
        [10, 20, 30, 40, 50],
      ],
      pageLength: 10,
      order: [[0, "asc"]],
      sPaginationType: "simple",
      aoColumns: [
        { mData: "id" },
        { mData: "family_name" },
        { mData: "given_name" },
        { mData: "middle_name" },
        { mData: "email" },
      ],
      aoColumnDefs: [
        { bSortable: true, aTargets: [0] },
        { bSortable: false, aTargets: [1, 2, 3, 4] },
        { bSearchable: true, aTargets: [1] },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.contact_id;
          },
          targets: 0,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.family_name;
          },
          targets: 1,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.given_name;
          },
          targets: 2,
        },
        {
          // The `data` parameter refers to the data for the cell (defined by the
          // `data` option, which defaults to the column being worked with, in
          // this case `data: 1`.
          render: function (data, type, row) {
            return row.middle_name;
          },
          targets: 3,
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
          targets: 4,
        },
      ],
    };
    // myFeature.config.table.DataTable(option);
  },
};

$(document).ready(myFeature.init);
