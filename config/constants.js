/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *   Unauthorized copying of this file, via any medium is strictly prohibited
 *   Proprietary and confidential
 *   @Written by Amine BEN DHIAB <amine@bps-tunisie.com>
 */
	

const mailtemplate = `<table style="border: 1px solid black;" style="height: 54px;"> <thead>  <tr style="border: 1px solid black; background-color : #0F6551;"><td style="padding: 20px; font-size: 30px; color:white"> Doculock</td></tr> </thead> <tbody>
<tr><td>
%MAIL_CONTENT%
<br><br>Bien cordialement,
<br>L’équipe Doculock
</td></tr>
	<tr><td><center><img src="cid:logo" width="100" style="text-align: center"/></center></td></tr>
</tbody></table>`

const mailtemplates = {
	Fr: {
	// 	ACCOUNT_ACTIVATION_SUBJECT: "Merci de confirmer votre inscription sur mrcsurvey.cloud",
	// 	ACCOUNT_ACTIVATION_CONTENT: mailtemplate.replace("%MAIL_CONTENT%", `
	// <center>
	// 	<br></br>
	// 		MRC Survey vous souhaite la bienvenue sur votre nouvel outil de performance.
	// 	<br>
	// 		Il ne vous reste que quelques clics pour compléter votre inscription.
	// 	<br><br>
	// 	<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >Activez votre compte</a>
	// 	<br><br>
	// </center>
	// Nous vous remercions de votre confiance	
	// <br><br>`),

		PASSWORD_CREATE_SUBJECT: "Création de mot de Passe",
		PASSWORD_CREATE: mailtemplate.replace("%MAIL_CONTENT%", `<center> Quelqu'un vous a partagé des fichiers, pour y accéder, veuillez utiliser les informations d'identification suivantes:
		<br>Login: %LOGIN%
		<br>Password: %PASSWORD% 
		<br>Vous sera ensuite demandé de changer votre mot de passe
		<br><br>Bienvenue sur Doculock
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		<br><br>Téléchargez l'application Doculock
		<br><br>
		<img src="cid:download" width="100" style="text-align: center"/>
		</center>
		<br><br>
		Nous vous remercions de votre confiance	
		<br><br>`),
		VERFICATION_CODE_SUBJECT: "Création de mot de Passe",
		VERFICATION_CODE_CREATE: mailtemplate.replace("%MAIL_CONTENT%", `<center> Quelqu'un vous a partagé des fichiers, pour y accéder veuillez utiliser les informations d'identification suivantes:
		<br>Login: %LOGIN%
		<br>Password: %PASSWORD% 
		<br>Vous sera ensuite demandé de changer votre mot de passe
		<br><br>Bienvenue sur Doculock
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		<br><br>Téléchargez l'application Doculock
		<br><br>
		<img src="cid:download" width="100" style="text-align: center"/>
		</center>
		<br><br>
		Nous vous remercions de votre confiance	
		<br><br>`),
		MAIL_CONFIRMATION_SUBJECT:"Confirmation de votre adresse mail",
		MAIL_CONFIRMATION_CREATE:mailtemplate.replace("%MAIL_CONTENT%", `<center>Votre compte %LOGIN% est sur le point d'être finalisé
		<br>Afin de valider la création de votre compte, veuillez cliquer sur ce lien
		<br>Bienvenue sur Doculock
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >Confirm Account</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		SHARE_NOTIFICATION_SUBJECT:"Quelqu'un a partagé un box avec vous",
		SHARE_NOTIFICATION_CREATE:mailtemplate.replace("%MAIL_CONTENT%", `<center> %SENDER% a partagé le box %BOX_NAME% avec vous
		<br>Bienvenue sur Doculock
		<br>
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		SHARED_NOTIFICATION_SUBJECT:"Quelqu'un a partagé votre box",
		SHARED_NOTIFICATION_CREATE:mailtemplate.replace("%MAIL_CONTENT%", `<center> %SENDER% a partagé votre box %BOX_NAME% avec %RECEIVERS%
		<br>Bienvenue sur Doculock
		<br>
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		COMMENT_DOCUMENT_NOTIFICATION_SUBJECT:"Quelqu'un a commenté votre document",
		COMMENT_DOCUMENT_NOTIFICATION_CREATE: mailtemplate.replace("%MAIL_CONTENT%", `<center> L'utilisateur %USER% a commenté votre document %DOCUMENT_NAME%
		<br>Bienvenue sur Doculock
		<br>
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		COMMENT_BOX_NOTIFICATION_SUBJECT:"Quelqu'un a commenté votre box",
		COMMENT_BOX_NOTIFICATION_CREATE: mailtemplate.replace("%MAIL_CONTENT%", `<center> L'utilisateur %USER% a commenté votre box %BOX_NAME%
		<br>Bienvenue sur Doculock
		<br>
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		UPLOAD_NOTIFICATION_SUBJECT:"Quelqu'un a ajouté un nouveau document",
		UPLOAD_NOTIFICATION_CREATE: mailtemplate.replace("%MAIL_CONTENT%", `<center> L'utilisateur %USER% a ajouté un nouveau document dans le box 
		<br>Bienvenue sur Doculock
		<br>
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		DOWNLOAD_NOTIFICATION_SUBJECT:"Quelqu'un a telechargé votre document",
		DOWNLOAD_NOTIFICATION_CREATE:mailtemplate.replace("%MAIL_CONTENT%", `<center>L'utilisateur %USER% a telechargé votre document %DOCUMENT_NAME% 
		<br>Bienvenue sur Doculock
		<br>
		<br>
		<a href="%LINK%" target="_blank" style="background-color:#0F6551;color: white;padding: 14px 25px;text-decoration: none;text-align: center;display: inline-block;" >DOCULOCK</a>
		</center>
		<br><br>
		Merci pour votre confiance	
		<br><br>`),
		}
		
		
		

};

module.exports = {
    mailtemplates
};
