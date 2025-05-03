<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/reset-password/{token}', function ($token) {
    return response()->json([
        'token' => $token,
        'message' => 'Use this token with your frontend reset form'
    ]);
})->name('password.reset');
