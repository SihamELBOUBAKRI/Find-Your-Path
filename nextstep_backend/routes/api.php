<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\MajorController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\SavedItemController;
use App\Http\Controllers\UserEventController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\SuccessStoryController;
use App\Http\Controllers\InstitutionMajorController;

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

    // success-stories routes
    Route::apiResource('success-stories', SuccessStoryController::class);//DONE
    Route::get('success-stories/by-major/{major}', [SuccessStoryController::class, 'byMajor']);//DONE
    Route::get('success-stories/by-institution/{institution}', [SuccessStoryController::class, 'byInstitution']);//DONE
    Route::get('success-stories/{slug}', [SuccessStoryController::class, 'show'])->where('slug', '[A-Za-z0-9-]+');//DONE

    // quotes routes
    Route::apiResource('quotes', QuoteController::class);//DONE

    // reviews routes
    Route::apiResource('reviews', ReviewController::class)->except(['update']);//DONE
    Route::patch('/reviews/{review}', [ReviewController::class, 'update']);//DONE
    Route::middleware('role:admin')->group(function () {
        Route::patch('/reviews/{review}/approve', [ReviewController::class, 'approve']);//DONE
        Route::delete('/reviews/{review}/admin', [ReviewController::class, 'adminDestroy']);
    });


    // UserEvent pivot table  Registration management
    Route::post('/events/{event}/register', [UserEventController::class, 'register']);//DONE
    Route::get('/events/{event}/users/{user}/verify', [UserEventController::class, 'verifyRegistration'])
    ->middleware('role:admin');//DONE
    Route::patch('/events/{event}/users/{user}/status', [UserEventController::class, 'updateStatus']);//DONE
    Route::delete('/events/{event}/users/{user}', [UserEventController::class, 'cancelRegistration']);//DONE
    Route::get('/events/{event}/registrations', [UserEventController::class, 'eventRegistrations']);//DONE
    Route::get('/users/{user}/registrations', [UserEventController::class, 'userRegistrations']);//DONE
    Route::get('/events/{event}/users/{user}/check', [UserEventController::class, 'checkRegistration']);//DONE
    // institution-majors routes
    Route::prefix('institution-majors')->group(function () {
        Route::post('/', [InstitutionMajorController::class, 'store']);//DONE
        Route::get('/institutions/{institution}', [InstitutionMajorController::class, 'institutionMajors']);//DONE
        Route::get('/majors/{major}', [InstitutionMajorController::class, 'majorInstitutions']);//DONE
        Route::get('/{institution}/{major}', [InstitutionMajorController::class, 'show']);//DONE
        Route::put('/{institution}/{major}', [InstitutionMajorController::class, 'update']);//DONE
        Route::delete('/{institution}/{major}', [InstitutionMajorController::class, 'destroy']);//DONE
    });
    // posts routes
    Route::apiResource('posts', PostController::class)->except(['destroy','update']);//DONE
    Route::post('/posts/{post}/like', [PostController::class, 'like']);//DONE
    Route::middleware(['post.owner'])->group(function () {
        Route::put('/posts/{post}', [PostController::class, 'update']);//DONE
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);//DONE
    });
    // comments routes
    Route::apiResource('posts.comments', CommentController::class)
        ->only(['index', 'store']);//DONE
    Route::delete('posts/{post}/comments/{comment}', [CommentController::class, 'destroy'])
    ->middleware(['comment.owner'])->scopeBindings();//DONE
    Route::put('posts/{post}/comments/{comment}', [CommentController::class, 'update'])
    ->middleware(['comment.owner'])->scopeBindings();//DONE

    // SavedItemController routes
    Route::get('/saved-items', [SavedItemController::class, 'index']);//DONE
    Route::post('/saved-items', [SavedItemController::class, 'store']);//DONE
    Route::delete('/saved-items/{savedItem}', [SavedItemController::class, 'destroy']);//DONE
    Route::get('/saved-items/institutions', [SavedItemController::class, 'savedInstitutions']);//DONE
    Route::get('/saved-items/events', [SavedItemController::class, 'savedEvents']);//DONE
    
});