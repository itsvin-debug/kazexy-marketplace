<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Game;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filtering, search, and sorting.
     */
    public function index(Request $request)
    {
        $query = Product::with(['game', 'category', 'seller:id,name,username,avatar,store_name,store_rating'])
            ->where('status', '!=', 'inactive');

        // Search in title, description, game name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('game', function ($g) use ($search) {
                      $g->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by game
        if ($request->filled('game')) {
            $gameSlug = $request->game;
            $query->whereHas('game', function ($g) use ($gameSlug) {
                $g->where('slug', $gameSlug)->orWhere('id', $gameSlug);
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $categorySlug = $request->category;
            $query->whereHas('category', function ($c) use ($categorySlug) {
                $c->where('slug', $categorySlug)->orWhere('id', $categorySlug);
            });
        }

        // Filter by delivery type
        if ($request->filled('delivery_type')) {
            $query->where('delivery_type', $request->delivery_type);
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        $sort = $request->get('sort', 'popular');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->latest();
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'popular':
            default:
                $query->orderBy('sold_count', 'desc');
                break;
        }

        $products = $query->paginate($request->get('per_page', 24));

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get single product detail
     */
    public function show($id)
    {
        $product = Product::with(['game', 'category', 'seller:id,name,username,avatar,store_name,store_rating,store_description'])
            ->findOrFail($id);

        $relatedProducts = Product::with(['game', 'category', 'seller:id,name,username,avatar,store_name,store_rating'])
            ->where('game_id', $product->game_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $product,
            'related' => $relatedProducts,
        ]);
    }

    /**
     * Get flash deal products
     */
    public function flashDeals()
    {
        $deals = Product::with(['game', 'category', 'seller:id,name,username,avatar,store_name,store_rating'])
            ->where('is_flash_deal', true)
            ->where('status', 'active')
            ->orderBy('sold_count', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $deals,
        ]);
    }

    /**
     * Get featured products
     */
    public function featured()
    {
        $featured = Product::with(['game', 'category', 'seller:id,name,username,avatar,store_name,store_rating'])
            ->where('is_featured', true)
            ->where('status', 'active')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $featured,
        ]);
    }

    /**
     * Get list of games with products count
     */
    public function games()
    {
        $games = Game::withCount(['products' => function ($q) {
            $q->where('status', 'active');
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $games,
        ]);
    }

    /**
     * Get list of categories
     */
    public function categories()
    {
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('status', 'active');
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
