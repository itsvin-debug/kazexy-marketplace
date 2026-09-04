<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Get all favorites for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $favorites = Favorite::with(['product.game', 'product.category', 'product.seller:id,name,username,avatar,store_name,store_rating'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $favorites,
        ]);
    }

    /**
     * Toggle favorite status of a product
     */
    public function toggle(Request $request, $productId)
    {
        $user = $request->user();
        $product = Product::findOrFail($productId);

        $favorite = Favorite::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $isFavorited = false;
            $message = 'Produk dihapus dari daftar favorit Anda.';
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'product_id' => $productId,
            ]);
            $isFavorited = true;
            $message = 'Produk berhasil ditambahkan ke daftar favorit!';
        }

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited,
            'message' => $message,
        ]);
    }

    /**
     * Remove from favorites
     */
    public function destroy(Request $request, $productId)
    {
        $user = $request->user();
        Favorite::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus dari favorit.',
        ]);
    }
}
