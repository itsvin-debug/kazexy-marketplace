<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'role',
        'phone',
        'balance',
        'tier',
        'bio',
        'has_store',
        'store_name',
        'store_description',
        'store_rating',
        'store_logo',
        'store_category',
        'store_contact',
        'discord_id',
        'riot_id',
        'steam_id',
        'moonton_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'balance'           => 'decimal:2',
            'store_rating'      => 'decimal:2',
            'has_store'         => 'boolean',
        ];
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'user_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'user_id');
    }

    public function favoriteProducts()
    {
        return $this->belongsToMany(Product::class, 'favorites', 'user_id', 'product_id')->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function sellerOrders()
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'user_id')->latest();
    }

    public function paymentMethods()
    {
        return $this->hasMany(UserPaymentMethod::class, 'user_id')->orderByDesc('is_primary');
    }
}
