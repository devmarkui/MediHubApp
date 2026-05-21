<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AppConfigController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DoctorController;
use App\Http\Controllers\Api\V1\FamilyController;
use App\Http\Controllers\Api\V1\LabOrderController;
use App\Http\Controllers\Api\V1\LabTestController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PackageController;
use App\Http\Controllers\Api\V1\PackagePurchaseController;
use App\Http\Controllers\Api\V1\PassbookController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public
    Route::post('auth/request-otp', [AuthController::class, 'requestOtp']);
    Route::post('auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('auth/register', [AuthController::class, 'register']);

    Route::get('doctors', [DoctorController::class, 'index']);
    Route::get('doctors/{doctor_id}/available-slots', [DoctorController::class, 'slots'])
        ->whereNumber('doctor_id');
    Route::get('doctors/{doctor:slug}', [DoctorController::class, 'show']);

    Route::get('lab-tests', [LabTestController::class, 'index']);

    Route::get('packages', [PackageController::class, 'index']);
    Route::get('packages/{package:code}', [PackageController::class, 'show']);

    Route::get('app/config', AppConfigController::class);

    Route::post('payments/payhere/notify', [PaymentController::class, 'payhereNotify']);

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::get('patients/me', [PatientController::class, 'show']);
        Route::put('patients/me', [PatientController::class, 'update']);
        Route::post('patients/me/avatar', [PatientController::class, 'uploadAvatar']);
        Route::post('patients/me/push-token', [PatientController::class, 'updatePushToken']);

        Route::get('patients/me/family', [FamilyController::class, 'index']);
        Route::post('patients/me/family', [FamilyController::class, 'store']);
        Route::put('patients/me/family/{id}', [FamilyController::class, 'update']);
        Route::delete('patients/me/family/{id}', [FamilyController::class, 'destroy']);

        Route::get('passbook', PassbookController::class);

        Route::get('appointments', [AppointmentController::class, 'index']);
        Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);
        Route::post('appointments', [AppointmentController::class, 'store']);
        Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

        Route::get('lab-orders', [LabOrderController::class, 'index']);
        Route::get('lab-orders/{order}', [LabOrderController::class, 'show']);
        Route::post('lab-orders', [LabOrderController::class, 'store']);

        Route::get('reports', [ReportController::class, 'index']);
        Route::get('reports/{report}', [ReportController::class, 'show']);
        Route::get('reports/{report}/download-url', [ReportController::class, 'downloadUrl']);

        Route::get('package-purchases', [PackagePurchaseController::class, 'index']);
        Route::post('package-purchases', [PackagePurchaseController::class, 'store']);

        Route::post('payments/initiate', [PaymentController::class, 'initiate']);
        Route::get('payments/{payment}', [PaymentController::class, 'show']);

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'readAll']);
    });
});
