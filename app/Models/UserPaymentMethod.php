<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPaymentMethod extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'account_number',
        'masked_phone',
        'balance',
        'account_name',
        'account_token',
        'binding_reference_id',
        'binding_status',
        'otp_code',
        'otp_expires_at',
        'token_expires_at',
        'is_primary',
    ];

    protected $hidden = [
        'account_token',
        'otp_code',
    ];

    protected $appends = [
        'provider_label',
        'is_linked',
    ];

    protected function casts(): array
    {
        return [
            'is_primary'       => 'boolean',
            'balance'          => 'float',
            'token_expires_at' => 'datetime',
            'otp_expires_at'   => 'datetime',
            'account_token'    => 'encrypted',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if payment method is actively linked & verified
     */
    public function getIsLinkedAttribute(): bool
    {
        return $this->binding_status === 'LINKED' && 
               ($this->token_expires_at === null || $this->token_expires_at->isFuture());
    }

    public function isLinked(): bool
    {
        return $this->getIsLinkedAttribute();
    }

    public function isEwallet(): bool
    {
        return in_array($this->provider, ['dana', 'ovo', 'gopay', 'shopeepay']);
    }

    /**
     * Get the human-readable provider label
     */
    public function getProviderLabelAttribute(): string
    {
        return match($this->provider) {
            'dana'      => 'DANA',
            'ovo'       => 'OVO',
            'gopay'     => 'GoPay',
            'shopeepay' => 'ShopeePay',
            'bca'       => 'Bank BCA',
            'mandiri'   => 'Bank Mandiri',
            'bni'       => 'Bank BNI',
            'bri'       => 'Bank BRI',
            default     => strtoupper($this->provider),
        };
    }
}
