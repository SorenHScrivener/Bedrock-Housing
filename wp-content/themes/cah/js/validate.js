$(document).ready(function(){
	jQuery.validator.setDefaults({
		debug: false,
		success: "valid"
	  });
	  //Set-up 3 seperate validates. One for what they share, via '.form' and one for each form's unique fields
	  //Meeting set-up will likely need conditional use of requires
	  //Use dropdown of times for time selection, and, worse case, for date selection too
	  //After forms, watch search vids, ajax pagination, and then person and buildings link overlay 
	$( ".form" ).validate({
		rules: {
		  contactName: {
			required: true,
			minlength: 3,
			maxlength: 36
		  },
		  email: {
			  required: true,
			  email: true
		  },
		  phoneNumber: {
			required: false,
			maxlength: 15,
			minlength: 7,
			digits: true
		 },
		 subject: {
			required: true
		 },
		 message: {
			required: true,
			minlength: 50,
			maxlength: 1000
		 }
		}
	  });
	ignore: ".ignore"
});