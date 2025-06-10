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
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SavedItemController;
use App\Http\Controllers\UserEventController;
use App\Http\Controllers\QuizAnswerController;
use App\Http\Controllers\BlockedUserController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\QuizQuestionController;
use App\Http\Controllers\SuccessStoryController;
use App\Http\Controllers\ContactRequestController;
use App\Http\Controllers\PersonalityTypeController;
use App\Http\Controllers\InstitutionMajorController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);//DONE
Route::post('/login', [AuthController::class, 'login']);//DONE
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);//DONE
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->name('password.update');


// Authenticated routes (Sanctum protected)
Route::middleware(['auth:sanctum'])->group(function () {
    //Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);//DONE
    Route::post('/change-password', [AuthController::class, 'changePassword']);//DONE
    Route::post('/delete-account', [AuthController::class, 'deactivateAccount']);
    Route::post('/restore-account', [AuthController::class, 'reactivateAccount']);


    // User routes
    Route::get('/users', [UserController::class, 'index']); 
    Route::get('/users/{user}', [UserController::class, 'show']); 
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']); 
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::patch('users/{user}/personality', [UserController::class, 'updatePersonality']);
    });
    Route::put('/profile', [UserController::class, 'updateProfile']);//DONE
    Route::get('/users/{user}/saved-items', [UserController::class, 'savedItems']);//DONE
    Route::get('/users/{user}/posts', [UserController::class, 'posts']);//DONE
    Route::get('users/by-personality/{type}', [UserController::class, 'getByPersonality']);

    // Institution routes
    Route::get('/institutions', [InstitutionController::class, 'index']);
    Route::get('/institutions/{institution}', [InstitutionController::class, 'show']);
    Route::get('/institutions/{institution}/majors', [InstitutionController::class, 'majors']);
    Route::get('/institutions/{institution}/events', [InstitutionController::class, 'events']);
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/institutions', [InstitutionController::class, 'store']);
        Route::put('/institutions/{institution}', [InstitutionController::class, 'update']);
        Route::delete('/institutions/{institution}', [InstitutionController::class, 'destroy']);
        
    });    

    // major routes
    Route::get('/majors', [MajorController::class, 'index']);
    Route::get('/majors/{major}', [MajorController::class, 'show']);
    Route::get('/majors/{major}/institutions', [MajorController::class, 'institutions']); 
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/majors', [MajorController::class, 'store']);
        Route::put('/majors/{major}', [MajorController::class, 'update']);
        Route::delete('/majors/{major}', [MajorController::class, 'destroy']);
    });

    // events routes
    Route::get('/events', [EventController::class, 'index']); 
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::middleware(['role:admin,mentor'])->group(function () {
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
    });

    // success-stories routes
    Route::get('/success-stories', [SuccessStoryController::class, 'index']);
    Route::get('/success-stories/{slug}', [SuccessStoryController::class, 'show'])->where('slug', '[A-Za-z0-9-]+');
    Route::get('/success-stories/by-major/{major}', [SuccessStoryController::class, 'byMajor']);
    Route::get('/success-stories/by-institution/{institution}', [SuccessStoryController::class, 'byInstitution']);
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/success-stories', [SuccessStoryController::class, 'store']);
        Route::put('/success-stories/{story}', [SuccessStoryController::class, 'update']);
        Route::delete('/success-stories/{story}', [SuccessStoryController::class, 'destroy']);
    });

    // quotes routes
    Route::get('/quotes', [QuoteController::class, 'index']);
    Route::get('/quotes/random', [QuoteController::class, 'random']);
    Route::get('/quotes/{quote}', [QuoteController::class, 'show']);
    Route::middleware(['auth:sanctum', 'role:admin,mentor'])->group(function () {
        Route::post('/quotes', [QuoteController::class, 'store']);
        Route::put('/quotes/{quote}', [QuoteController::class, 'update']);
        Route::delete('/quotes/{quote}', [QuoteController::class, 'destroy']);
    });

    // reviews routes
    Route::apiResource('reviews', ReviewController::class);//DONE
    Route::middleware('role:admin')->group(function () {
        Route::patch('/reviews/{review}/approve', [ReviewController::class, 'approve']);//DONE
        Route::delete('/reviews/{review}/admin', [ReviewController::class, 'adminDestroy']);
    });


    // UserEvent pivot table  Registration management
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/events/{event}/register', [UserEventController::class, 'register']);
        Route::delete('/events/{event}/users/{user}', [UserEventController::class, 'cancelRegistration'])
            ->middleware('check.registration.owner');
        Route::get('/events/{event}/users/{user}/check', [UserEventController::class, 'checkRegistration']);
        Route::get('/users/{user}/registrations', [UserEventController::class, 'userRegistrations'])
            ->middleware('check.user.access');
        Route::middleware('role:admin')->group(function () {
            Route::get('/events/{event}/users/{user}/verify', [UserEventController::class, 'verifyRegistration']);
            Route::patch('/events/{event}/users/{user}/status', [UserEventController::class, 'updateStatus']);
            Route::get('/events/{event}/registrations', [UserEventController::class, 'eventRegistrations']);
        });
    });

    // institution-majors routes
    Route::prefix('institution-majors')->group(function () {
    Route::get('/institutions/{institution}', [InstitutionMajorController::class, 'institutionMajors']);
    Route::get('/majors/{major}', [InstitutionMajorController::class, 'majorInstitutions']);
    Route::get('/{institution}/{major}', [InstitutionMajorController::class, 'show']);
    Route::middleware(['role:admin'])->group(function () {
            Route::post('/', [InstitutionMajorController::class, 'store']);
            Route::put('/{institution}/{major}', [InstitutionMajorController::class, 'update']);
            Route::delete('/{institution}/{major}', [InstitutionMajorController::class, 'destroy']);
        });
    });

    // posts routes
    Route::apiResource('posts', PostController::class)->except(['destroy','update']);//DONE
    Route::post('/posts/{post}/like', [PostController::class, 'like']);//DONE
    Route::middleware(['post.owner'])->group(function () {
        Route::put('/posts/{post}', [PostController::class, 'update']);//DONE
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);//DONE
    });
    // comments routes
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::middleware(['comment.owner'])->group(function () {
        Route::put('/posts/{post}/comments/{comment}', [CommentController::class, 'update'])
            ->scopeBindings();
        Route::delete('/posts/{post}/comments/{comment}', [CommentController::class, 'destroy'])
            ->scopeBindings();
    });

    // SavedItemController routes
    Route::get('/saved-items', [SavedItemController::class, 'index']);//DONE
    Route::post('/saved-items', [SavedItemController::class, 'store']);//DONE
    Route::delete('/saved-items/{savedItem}', [SavedItemController::class, 'destroy']);//DONE
    Route::get('/saved-items/institutions', [SavedItemController::class, 'savedInstitutions']);//DONE
    Route::get('/saved-items/events', [SavedItemController::class, 'savedEvents']);//DONE
    

    // Quiz Questions
    Route::get('/questions', [QuizQuestionController::class, 'index']);
    Route::get('/questions/{question}', [QuizQuestionController::class, 'show']);
    Route::post('/questions/{question}/mappings', [QuizQuestionController::class, 'addPersonalityMapping']);

    Route::middleware(['role:admin'])->group(function () {
        Route::post('/questions', [QuizQuestionController::class, 'store']);
        Route::patch('/questions/{question}', [QuizQuestionController::class, 'update']);
        Route::delete('/questions/{question}', [QuizQuestionController::class, 'destroy']);
        Route::get('/questions/{question}/mappings', [QuizQuestionController::class, 'getPersonalityMappings']);
    });

   // Quiz Answers Routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/quiz/answers', [QuizAnswerController::class, 'store']);
        Route::get('/quiz/personality-analysis', [QuizAnswerController::class, 'personalityAnalysis']);
        Route::middleware('role:admin')->group(function () {
            Route::get('/quiz/answers', [QuizAnswerController::class, 'index']);
            Route::get('/quiz/answers/{answer}', [QuizAnswerController::class, 'show']);
            Route::put('/quiz/answers/{answer}', [QuizAnswerController::class, 'update']);
            Route::delete('/quiz/answers/{answer}', [QuizAnswerController::class, 'destroy']);
            Route::get('/quiz/answers/user/{user}', [QuizAnswerController::class, 'getUserAnswers']);
        });
    });

    // Personality Types Routes
    Route::apiResource('personality-types', PersonalityTypeController::class)
        ->only(['index', 'show']); 
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::apiResource('personality-types', PersonalityTypeController::class)
            ->except(['index', 'show']);
    });

    // Messages
    Route::prefix('messages')->group(function () {
        Route::get('/conversations', [MessageController::class, 'conversations']);
        Route::get('/{user}', [MessageController::class, 'index']);//DONE
        Route::post('/', [MessageController::class, 'store']);//DONE
        Route::post('/mark-read', [MessageController::class, 'markAsRead']);//DONE
        Route::post('/{message}/resend', [MessageController::class, 'resend']);//DONE

    });

    // Contact Requests
    Route::prefix('contact-requests')->group(function () {
        Route::get('/', [ContactRequestController::class, 'index']);//DONE
        Route::post('/', [ContactRequestController::class, 'store']);//DONE
        Route::post('/{contactRequest}/respond', [ContactRequestController::class, 'respond']);//DONE
        Route::get('/{contactRequest}', [ContactRequestController::class, 'show']);//DONE

    });
    Route::get('/my-contact-requests', [ContactRequestController::class, 'myRequests']);//DONE


    // Blocked Users
    Route::prefix('blocked-users')->group(function () {
        Route::get('/', [BlockedUserController::class, 'index']);//DONE
        Route::post('/', [BlockedUserController::class, 'store']);//DONE
        Route::delete('/{user}', [BlockedUserController::class, 'destroy']);//DONE
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);//DONE
        Route::post('/mark-read', [NotificationController::class, 'markAsRead']);//DONE
        Route::delete('/', [NotificationController::class, 'destroy']);//DONE
    });
});
