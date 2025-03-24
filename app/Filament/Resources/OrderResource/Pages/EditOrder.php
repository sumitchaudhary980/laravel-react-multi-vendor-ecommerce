<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

// In the EditOrder class (app/Filament/Resources/OrderResource/Pages/EditOrder.php)
public function getRecord(): Order
{
    return Order::with('address')->find($this->record->getKey());
}

}
