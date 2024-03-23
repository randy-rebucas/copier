/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */
exports.index = async (req, res, next) => {
  // create log table
  let logTbl = await createLogTable(req.connection);
  if (!logTbl) {
    res.status(500).send('Something error upon creating log table!')
  }

  let contactTbl = await createContactTable(req.connection);
  if (!contactTbl) {
    res.status(500).send('Something error upon creating contact table!')
  }

  let orderTbl = await createOrderTable(req.connection);
  if (!orderTbl) {
    res.status(500).send('Something error upon creating order table!')
  }

  let productTbl = await createProductTable(req.connection);
  if (!productTbl) {
    res.status(500).send('Something error upon creating product table!')
  }

  let transactionTbl = await createTransactionTable(req.connection);
  if (!transactionTbl) {
    res.status(500).send('Something error upon creating transaction table!')
  }

  let tagTbl = await createTagTable(req.connection);
  if (!tagTbl) {
    res.status(500).send('Something error upon creating tag table!')
  }

  let scriptionTbl = await createSubscriptionTable(req.connection);
  if (!scriptionTbl) {
    res.status(500).send('Something error upon creating subscription table!')
  }

  let campaignTbl = await createCampaignTable(req.connection);
  if (!campaignTbl) {
    res.status(500).send('Something error upon creating campaign table!')
  }

  let opportunityTbl = await createOpportunityTable(req.connection);
  if (!opportunityTbl) {
    res.status(500).send('Something error upon creating opportunity table!')
  }

  res.json({
    message: 'Installing db done!'
  })
};

const createLogTable = async (connection) => {
  return new Promise((resolve, reject) => {
    let query = "CREATE TABLE IF NOT EXISTS `logs` ( `id` int(11) NOT NULL auto_increment,`offset` int(11) NOT NULL,`last_id` int(11) NOT NULL,`type`  VARCHAR(100) NOT NULL default '',`created_at` TIMESTAMP NULL default CURRENT_TIMESTAMP, PRIMARY KEY (`id`))";
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}

const createContactTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS contacts(
      id int(11) NOT NULL auto_increment,
      email_opted_in boolean,
      last_updated datetime,
      date_created datetime,
      owner_id varchar(50),
      given_name varchar(150),
      middle_name varchar(150),
      family_name varchar(150),
      email_status varchar(150),
      ScoreValue varchar(150),
      company JSON,
      email_addresses JSON,
      addresses JSON,
      phone_numbers JSON,
      contact_id int(11),
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  })
}

const createOrderTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS orders(
      id int(11) NOT NULL auto_increment,
      order_id int(11),
      title varchar(255),
      status char(50),
      total decimal(10, 2),
      contact JSON,
      note text(1000) default null,
      terms text(1000) default null,
      source_type text(1000) default null,
      creation_date datetime,
      modification_date datetime,
      order_date datetime,
      lead_affiliate_id int(11) default 0,
      sales_affiliate_id int(11) default 0,
      total_paid decimal(10, 2),
      total_due decimal(10, 2),
      refund_total decimal(10, 2),
      shipping_information JSON,
      allow_payment boolean default null,
      allow_paypal boolean default null,
      order_items JSON,
      payment_plan JSON,
      invoice_number int(11),
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  })
}

const createProductTable = (connection) => {
  let query = `CREATE TABLE IF NOT EXISTS products(
      id int(11) NOT NULL auto_increment,
      product_id int(11),
      sku char(50),
      url varchar(255),
      status int(11),
      product_name varchar(225),
      product_desc text,
      product_price decimal(10, 2),
      product_short_desc varchar(225),
      subscription_only boolean default null,
      product_options JSON,
      subscription_plans JSON,
      PRIMARY KEY (id)
  )`;
  return new Promise((resolve, reject) => {
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}

const createTransactionTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS transactions(
      id int(11) NOT NULL auto_increment,
      amount decimal(10, 2),
      collection_method varchar(50),
      contact_id int(11),
      currency char(50),
      errors varchar(225),
      gateway varchar(225),
      gateway_account_name varchar(225),
      order_ids varchar(225),
      orders JSON,
      paymentDate datetime,
      status char(50),
      test boolean default null,
      transaction_date datetime,
      type char(50),
      transaction_id int(11),
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}

const createTagTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS tags(
      id int(11) NOT NULL auto_increment,
      tag_id int(11),
      name varchar(225),
      description varchar(225),
      category JSON,
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}

const createSubscriptionTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS subscriptions(
      id int(11) NOT NULL auto_increment,
      subscription_id int(11),
      active boolean default null,
      allow_tax boolean default null,
      auto_charge boolean default null,
      billing_amount decimal(10, 2),
      billing_cycle enum('YEAR','MONTH','WEEK', 'DAY'),
      billing_frequency int,
      contact_id int(11),
      credit_card_id int(11),
      end_date datetime,
      next_bill_date datetime,
      payment_gateway_id int,
      product_id int(11),
      quantity int(11),
      sale_affiliate_id int(11),
      start_date datetime,
      subscription_plan_id int(11),
      use_default_payment_gateway boolean default null,
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}

const createCampaignTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS campaigns(
      id int(11) NOT NULL auto_increment,
      campaign_id int(11),
      created_by_global_id int,
      date_created datetime,
      error_message varchar(225),
      goals JSON,
      locked boolean default null,
      name varchar(225),
      published_date datetime,
      published_status boolean default null,
      published_time_zone varchar(225),
      sequences JSON,
      time_zone varchar(225),
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}

const createOpportunityTable = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `CREATE TABLE IF NOT EXISTS opportunities(
      id int(11) NOT NULL auto_increment,
      opportunity_id int(11),
      affiliate_id int(11),
      contact JSON,
      custom_fields JSON,
      date_created datetime,
      estimated_close_date datetime,
      include_in_forecast int(11),
      last_updated datetime,
      next_action_date datetime,
      next_action_notes varchar(225),
      opportunity_notes varchar(225),
      opportunity_title varchar(225),
      projected_revenue_high decimal(10, 2),
      projected_revenue_low decimal(10, 2),
      stage JSON,
      user JSON,
      PRIMARY KEY (id)
  )`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  });
}
