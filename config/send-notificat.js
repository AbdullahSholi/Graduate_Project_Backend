const {ONE_SIGNAL_CONFIG} = require("./config");
const pushNotificationService = require("./service");

exports.sendNotification = (req, res, next)=>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {"en": "Test Push Notifications"},
        included_segments: ["All"],
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "Custom Notification"
        }

    } 
    pushNotificationService.sendNotification(message, (error, result)=>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        })
    })
}

exports.sendNotificationToDevice = (req, res, next)=>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {"en": `${req.body.storeName}: New amazing things arrived!!`},
        included_segments: ["included_player_ids"],
        include_player_ids: req.body.devices,
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "Custom Notification"
        }

    } 
    pushNotificationService.sendNotification(message, (error, result)=>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        })
    })
}

exports.sendCustomNotificationToDevice = (req, res, next)=>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {"en": `${req.body.messageSubject}: ${req.body.messageContent}`},
        included_segments: ["included_player_ids"],
        include_player_ids: req.body.devices,
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "Custom Notification"
        }

    } 
    pushNotificationService.sendNotification(message, (error, result)=>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        })
    })
}