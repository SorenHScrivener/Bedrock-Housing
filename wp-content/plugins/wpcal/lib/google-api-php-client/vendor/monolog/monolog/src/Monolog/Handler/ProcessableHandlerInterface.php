<?php

declare (strict_types=1);
/*
 * This file is part of the Monolog package.
 *
 * (c) Jordi Boggiano <j.boggiano@seld.be>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace WPCal\GoogleAPI\Monolog\Handler;

use WPCal\GoogleAPI\Monolog\Processor\ProcessorInterface;
/**
 * Interface to describe loggers that have processors
 *
 * @author Jordi Boggiano <j.boggiano@seld.be>
 */
interface ProcessableHandlerInterface
{
    /**
     * Adds a processor in the stack.
     *
     * @param  ProcessorInterface|callable $callback
     * @return HandlerInterface            self
     */
    public function pushProcessor(callable $callback) : \WPCal\GoogleAPI\Monolog\Handler\HandlerInterface;
    /**
     * Removes the processor on top of the stack and returns it.
     *
     * @throws \LogicException In case the processor stack is empty
     * @return callable
     */
    public function popProcessor() : callable;
}
