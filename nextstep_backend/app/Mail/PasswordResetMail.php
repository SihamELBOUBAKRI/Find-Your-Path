<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The password reset URL.
     *
     * @var string
     */
    public $resetUrl;

    /**
     * Create a new message instance.
     *
     * @param  string  $resetUrl
     * @return void
     */
    public function __construct($resetUrl)
    {
        $this->resetUrl = $resetUrl;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Password Reset Request - ML Inventory System')
                   ->markdown('emails.password_reset') // Using markdown for better styling
                   ->with([
                       'resetUrl' => $this->resetUrl,
                       'expiryTime' => config('auth.passwords.users.expire') / 60 // Convert to hours
                   ]);
    }
}