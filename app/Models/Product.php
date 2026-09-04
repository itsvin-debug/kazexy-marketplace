<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'game_id',
        'category_id',
        'title',
        'slug',
        'description',
        'price',
        'original_price',
        'stock',
        'delivery_type',
        'account_data',
        'image_url',
        'status',
        'rating',
        'sold_count',
        'is_featured',
        'is_flash_deal',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_flash_deal' => 'boolean',
        'stock' => 'integer',
        'sold_count' => 'integer',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
