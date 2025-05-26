<?php

namespace App\Providers;

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\CheckPostOwner;
use Illuminate\Support\ServiceProvider;
use App\Http\Middleware\CheckUserAccess;
use App\Http\Middleware\CheckCommentOwner;
use App\Http\Middleware\CheckRegistrationOwner;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
{
        // Register middleware alias
        $router = $this->app['router'];
        $router->aliasMiddleware('role', CheckRole::class);
        $router->aliasMiddleware('post.owner', CheckPostOwner::class);
        $router->aliasMiddleware('comment.owner',CheckCommentOwner::class);
        $router->aliasMiddleware('check.registration.owner', CheckRegistrationOwner::class);
        $router->aliasMiddleware('check.user.access', CheckUserAccess::class);
        // If you need to configure routes, do it like this:
        $this->app->booted(function () {
            $this->app['router']->get('/test', function () {
                return 'Test route';
            });
        });
    }
}
