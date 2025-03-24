<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Forms\Form;
use Filament\Resources\Pages\EditRecord;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;


class ProductImages extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected static ?string $title = "Images";

    protected static ?string $navigationIcon= 'heroicon-c-photo';

    public function form(Form $form): Form
    {
        return $form
        ->schema([
            SpatieMediaLibraryFileUpload::make('images')
            ->label(false)
            ->image()
            ->multiple()
            ->openable()
            ->panelLayout('grid')
            ->collection('images') // Ensure this matches
            ->reorderable()
            ->appendFiles()
            ->preserveFileNames(false)
            ->columnSpan(2)
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

}
