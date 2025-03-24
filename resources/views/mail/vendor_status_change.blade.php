<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendor Status Update</title>
    <style>
        @media only screen and (max-width: 600px) {
            .inner-body {
                width: 100% !important;
            }
            .footer {
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
            }
        }

        .logo {
            width: 150px;
            height: auto;
        }

        .content-cell {
            padding: 20px;
        }

        .panel {
            background-color: #f4f4f4;
            border-radius: 5px;
            padding: 20px;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            padding: 10px;
        }

        .footer a {
            color: #888;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="header" style="text-align: center; padding: 20px;">
                            <a href="{{ config('app.url') }}" style="display: inline-block;">
                                <img src="{{ asset('img/logo.png') }}" class="logo" alt="{{ config('app.name') }} Logo">
                            </a>
                        </td>
                    </tr>

                    <!-- Email Body -->
                    <tr>
                        <td class="body" width="100%" cellpadding="0" cellspacing="0" style="border: hidden !important;">
                            <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <!-- Body content -->
                                <tr>
                                    <td class="content-cell">
                                        <h1 style="text-align: center; font-size: 24px;">Vendor Status Update</h1>

                                        <p>Hello {{ $vendor->store_name }},</p>

                                        <p>Your vendor status has been updated to: <strong>{{ $status }}</strong>.</p>

                                        @if($status == 'Approved')
                                            <div class="panel">
                                                Congratulations! Your vendor status has been approved.
                                            </div>
                                        @elseif($status == 'Rejected')
                                            <div class="panel">
                                                Unfortunately, your vendor status has been rejected.
                                            </div>
                                        @endif

                                        <p>Thank you for your cooperation!</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
