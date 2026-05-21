<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'payhere' => [
        'merchant_id' => env('PAYHERE_MERCHANT_ID'),
        'merchant_secret' => env('PAYHERE_MERCHANT_SECRET'),
        'mode' => env('PAYHERE_MODE', 'sandbox'),
        'return_url' => env('PAYHERE_RETURN_URL', 'medihub://payment/success'),
        'cancel_url' => env('PAYHERE_CANCEL_URL', 'medihub://payment/cancel'),
        'notify_url' => env('PAYHERE_NOTIFY_URL'),
    ],

    'b2' => [
        'key_id' => env('B2_KEY_ID'),
        'application_key' => env('B2_APPLICATION_KEY'),
        'bucket' => env('B2_BUCKET_NAME', 'medihub-reports'),
        'endpoint' => env('B2_ENDPOINT', 'https://s3.us-west-002.backblazeb2.com'),
        'region' => env('B2_REGION', 'us-west-002'),
    ],

    'notify_lk' => [
        'api_key' => env('NOTIFY_LK_API_KEY'),
        'sender_id' => env('NOTIFY_LK_SENDER_ID', 'MediHub'),
    ],

];
