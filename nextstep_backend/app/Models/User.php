<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasApiTokens;
    use SoftDeletes;
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'bio',
        'linkedin_url',
        'phone',
        'personality_type',
        'recommended_major',
        'status','login_status','last_login_at','last_logout_at','deactivated_at', 'deleted_at','ban_date'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // app/Models/User.php

public function contactRequestsSent()
{
    return $this->hasMany(ContactRequest::class, 'sender_id');
}

public function contactRequestsReceived()
{
    return $this->hasMany(ContactRequest::class, 'receiver_id');
}

public function savedItems()
{
    return $this->hasMany(UserSavedItem::class);
}

public function blockedUsers()
{
    return $this->belongsToMany(User::class, 'blocked_users', 'user_id', 'blocked_user_id')
               ->withTimestamps();
}

public function blockedBy()
{
    return $this->belongsToMany(User::class, 'blocked_users', 'blocked_user_id', 'user_id')
               ->withTimestamps();
}

public function posts()
{
    return $this->hasMany(Post::class);
}

public function comments()
{
    return $this->hasMany(Comment::class);
}

public function quizAnswers()
{
    return $this->hasMany(QuizAnswer::class);
}

public function registeredEvents()
{
    return $this->belongsToMany(Event::class, 'user_event')
               ->withPivot('status')
               ->withTimestamps();
}

public function notifications()
{
    return $this->hasMany(Notification::class);
}

public function sentMessages()
{
    return $this->hasMany(Message::class, 'sender_id');
}

public function receivedMessages()
{
    return $this->hasMany(Message::class, 'receiver_id');
}

public function reviews()
{
    return $this->hasMany(Review::class);
}
public function likedPosts(): BelongsToMany
{
    return $this->belongsToMany(Post::class, 'post_user_likes')
        ->withTimestamps();
}

protected static function boot()
{
    parent::boot();

    static::saving(function ($user) {
        // Automatically ban inactive accounts after 30 days
        if ($user->status === 'inactive' && $user->deactivated_at && $user->deactivated_at->diffInDays() >= 30) {
            $user->status = 'banned';
            $user->banned_at = now();
            $user->deleted_at = now();
            
        }
    });
}
}
