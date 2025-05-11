<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\MajorController;
use App\Http\Controllers\InstitutionController;

// Public routes (no authentication required)
Route::post('/users', [UserController::class, 'store']); //DONE
Route::post('/register', [AuthController::class, 'register']);//DONE
Route::post('/login', [AuthController::class, 'login']);//DONE
Route::post('/restore-account', [AuthController::class, 'reactivateAccount']);


   
// Authenticated routes (Sanctum protected)
Route::middleware(['auth:sanctum'])->group(function () {
    //Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);//DONE
    Route::post('/change-password', [AuthController::class, 'changePassword']);//DONE
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);//DONE
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);//DONE
    Route::post('/delete-account', [AuthController::class, 'deactivateAccount']);
    

    // User routes
    Route::apiResource('users', UserController::class)->except(['store']);//DONE
    Route::put('/profile', [UserController::class, 'updateProfile']);//DONE
    Route::get('/users/{user}/saved-items', [UserController::class, 'savedItems']);//DONE
    Route::get('/users/{user}/posts', [UserController::class, 'posts']);//DONE

    // Institution routes
    Route::apiResource('institutions', InstitutionController::class);//DONE
    Route::get('/institutions/{institution}/majors', [InstitutionController::class, 'majors']);//DONE
    Route::get('/institutions/{institution}/events', [InstitutionController::class, 'events']);//DONE
    
    // major routes
    Route::apiResource('majors', MajorController::class);
    Route::get('majors/{major}/institutions', [MajorController::class, 'institutions']);

    // events routes
    Route::apiResource('events', EventController::class);//DONE
    Route::post('events/{event}/register', [EventController::class, 'registerUser']);//DONE
    Route::get('events/{event}/users', [EventController::class, 'getRegisteredUsers']);//DONE
    
});