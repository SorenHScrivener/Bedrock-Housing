$(document).ready(function(){

	$( ".form" ).validate({
		success: "valid",
		debug: true,
		errorElement: "span",
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
			phoneUS: true
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