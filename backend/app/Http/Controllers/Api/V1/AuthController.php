<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\RequestOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Services\OtpService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController
{
    public function __construct(private OtpService $otp) {}

    /**
     * Stage 1 — sign in with mobile number + password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $phone = (string) $request->validated('phone');
        $password = (string) $request->validated('password');

        $key = 'login:'.$phone;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return ApiResponse::fail('Too many attempts. Please wait a minute and try again.', 429);
        }

        $patient = Patient::query()->where('phone', $phone)->first();

        if ($patient === null || $patient->password === null || ! Hash::check($password, $patient->password)) {
            RateLimiter::hit($key, 60);

            return ApiResponse::fail('Incorrect mobile number or password.', 422);
        }

        if (! $patient->is_active) {
            return ApiResponse::fail('This account is inactive. Please contact MediHub.', 403);
        }

        RateLimiter::clear($key);
        $token = $patient->createToken('mobile')->plainTextToken;

        return ApiResponse::ok([
            'token' => $token,
            'patient' => (new PatientResource($patient))->resolve(),
        ], 'Signed in.');
    }

    public function requestOtp(RequestOtpRequest $request): JsonResponse
    {
        $phone = (string) $request->validated('phone');

        $key = 'otp:'.$phone;
        if (RateLimiter::tooManyAttempts($key, 1)) {
            return ApiResponse::fail('Please wait before requesting another OTP.', 429);
        }
        RateLimiter::hit($key, 60);

        $record = $this->otp->issue($phone);

        return ApiResponse::ok([
            'otp_id' => $record->id,
        ], 'OTP sent.');
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $phone = (string) $request->validated('phone');
        $code = (string) $request->validated('code');
        $otpId = (int) $request->validated('otp_id');

        $verified = $this->otp->verify($otpId, $phone, $code);
        if (! $verified) {
            return ApiResponse::fail('Invalid or expired code.', 422);
        }

        $patient = Patient::query()->where('phone', $phone)->first();
        $isNew = $patient === null;

        if ($patient === null) {
            return ApiResponse::ok([
                'token' => null,
                'patient' => null,
                'is_new' => true,
            ], 'OTP verified.');
        }

        $token = $patient->createToken('mobile')->plainTextToken;

        return ApiResponse::ok([
            'token' => $token,
            'patient' => (new PatientResource($patient))->resolve(),
            'is_new' => false,
        ], 'Signed in.');
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $phone = (string) $request->validated('phone');

        if (Patient::query()->where('phone', $phone)->exists()) {
            return ApiResponse::fail('A patient with this phone number already exists.', 409);
        }

        // OTP is optional today (password-based sign-up). When an SMS gateway is
        // wired up later, the app can send otp_id + code and we verify here.
        $otpId = $request->validated('otp_id');
        $code = $request->validated('code');
        if ($otpId !== null && $code !== null) {
            $verified = $this->otp->verify((int) $otpId, $phone, (string) $code);
            if (! $verified) {
                return ApiResponse::fail('Invalid or expired code.', 422);
            }
        }

        $patient = Patient::query()->create([
            'phone' => $phone,
            'name' => (string) $request->validated('name'),
            'password' => (string) $request->validated('password'),
            'email' => $request->validated('email'),
            'dob' => $request->validated('dob'),
            'gender' => $request->validated('gender'),
            'height_cm' => $request->validated('height_cm'),
            'weight_kg' => $request->validated('weight_kg'),
            'language' => 'en',
        ]);

        $token = $patient->createToken('mobile')->plainTextToken;

        return ApiResponse::ok([
            'token' => $token,
            'patient' => (new PatientResource($patient))->resolve(),
        ], 'Account created.', 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user !== null) {
            $token = $user->currentAccessToken();
            if (method_exists($token, 'delete')) {
                $token->delete();
            }
        }

        return ApiResponse::ok(null, 'Signed out.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof Patient) {
            return ApiResponse::fail('Unauthenticated.', 401);
        }

        return ApiResponse::ok((new PatientResource($user))->resolve());
    }
}
