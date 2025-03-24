<?php

namespace App\Console\Commands;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PayoutVendors extends Command
{

    protected $signature = 'payout:vendors';


    protected $description = 'Perform vendors payout';


    public function handle()
    {
        //Log the process of payout process
        $this->info('Starting monthly payout process for vendors...');

        $vendors = Vendor::eligibleForPayout()->get();
        foreach ($vendors as $vendor) {
            $this->processPayout($vendor);
        }

        //Log the end of the payout process
        $this->info('Monthly payout process completed');

        return Command::SUCCESS;

    }

    protected function processPayout(Vendor $vendor)
    {
        $this->info('Processing payout for vendor [ID='.$vendor->user_id.']-"' .$vendor->store_name.'"');
        try {
            DB::beginTransaction();
            $startingFrom = Payout::where('vendor_id', $vendor->user_id)
            ->orderBy('until', 'desc')
            ->value('until');

            $startingFrom = $startingFrom ?: Carbon::make('1970-01-01 6:57:23');

            $until = Carbon::now()->subMonthNoOverflow()->startOfMonth();


            $vendorSubTotal = Order::query()
            ->where('vendor_user_id',$vendor->user_id)
            ->where('status', OrderStatusEnum::Paid->value)
            ->whereBetween('created_at', [$startingFrom, $until])
            ->sum('vendor_subtotal');

            if($vendorSubTotal){
                $this->info( 'Payoout made with amount: '. $vendorSubTotal);
                Payout::create([
                    'vendor_id' => $vendor->user_id,
                    'amount' => $vendorSubTotal,
                    'starting_from'=> $startingFrom,
                    'until'=> $until,
                ]);
                $vendor->user->transfer((int)($vendorSubTotal * 100), config('app.currency'));

            } else {
                $this->info( 'Nothing to process');
            }
            DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error($e->getMessage());
        }
    }
}
