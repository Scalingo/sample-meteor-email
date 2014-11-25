Emails = new Mongo.Collection("emails");

if (Meteor.isClient) {
  Template.emails.helpers({
    emails: function () {
      console.log(Emails.find().fetch());
      return Emails.find();
    }
  });

  Template.form.events({
    'submit .email-form': function(event) {
      event.preventDefault();
      var $input = $(event.target).find('[type=email]');
      if (! $input.val())
        return;

      Meteor.call('sendEmail', $input.val());
      $input.val('');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    var basicAuth = new HttpBasicAuth(
      process.env.APP_USERNAME || "user",
      process.env.APP_PASSWORD || "password"
    );
    basicAuth.protect();
  });

  Meteor.methods({
    sendEmail: function(recipient) {
      console.log(recipient)

      check(recipient, String);

      email = {
        recipient: recipient,
        createdAt: new Date(),
        status: "Sending"
      };

      email._id = Emails.insert(email);

      console.log("Send email to " + email.recipient)

      this.unblock();

      Email.send({
        from: process.env.EMAIL_FROM,
        to: email.recipient,
        subject: "Hello " + email.recipient,
        text: "Hello " + email.recipient
      });

      email.status = "Sent"
      Emails.update({_id: email._id}, email)
    }
  });
}
