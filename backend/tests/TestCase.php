<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        // Silence PHP 8.5 deprecation notices from Laravel's stock database.php
        // (PDO::MYSQL_ATTR_SSL_CA) so they don't drown out Pest output.
        error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

        parent::setUp();
    }
}
