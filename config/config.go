// Package config contains the configuration schema and some utilities.
package config

import (
	"crypto/tls"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/pkg/errors"
)

// Config represents the configuration for the BTRY application.
type Config struct {
	Tor    Tor    `yaml:"tor"`
	API    API    `yaml:"api"`
	Server Server `yaml:"server"`
}

// API configuration.
type API struct {
	Logger Logger `yaml:"logger"`
}

// Logger configuration.
type Logger struct {
	Label   string `yaml:"label"`
	OutFile string `yaml:"out_file"`
	Level   uint8  `yaml:"level"`
}

// Server configuration.
type Server struct {
	Address         string            `yaml:"address"`
	TLSCertificates []tls.Certificate `yaml:"tls_certificates"`
	Logger          Logger            `yaml:"logger"`
	Timeout         struct {
		Read     time.Duration `yaml:"read"`
		Write    time.Duration `yaml:"write"`
		Shutdown time.Duration `yaml:"shutdown"`
		Idle     time.Duration `yaml:"idle"`
	} `yaml:"timeout"`
}

// Tor configuration.
type Tor struct {
	Address string        `yaml:"address"`
	Timeout time.Duration `yaml:"timeout"`
}

// New returns a configuration object loaded from environment variables.
func New() (Config, error) {

	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {

		return Config{}, errors.Wrap(err, "loading .env file")
	}

	var config Config

	// Load server configuration
	config.Server.Address = getEnv("SERVER_ADDRESS", ":8080")

	// Load server timeouts
	config.Server.Timeout.Read = getDurationEnv("SERVER_TIMEOUT_READ", 15*time.Second)
	config.Server.Timeout.Write = getDurationEnv("SERVER_TIMEOUT_WRITE", 15*time.Second)
	config.Server.Timeout.Shutdown = getDurationEnv("SERVER_TIMEOUT_SHUTDOWN", 15*time.Second)
	config.Server.Timeout.Idle = getDurationEnv("SERVER_TIMEOUT_IDLE", 60*time.Second)

	// Load server logger
	config.Server.Logger.Label = getEnv("SERVER_LOGGER_LABEL", "server")
	config.Server.Logger.OutFile = getEnv("SERVER_LOGGER_OUT_FILE", "")
	config.Server.Logger.Level = getUint8Env("SERVER_LOGGER_LEVEL", 4)

	// Load API logger
	config.API.Logger.Label = getEnv("API_LOGGER_LABEL", "api")
	config.API.Logger.OutFile = getEnv("API_LOGGER_OUT_FILE", "")
	config.API.Logger.Level = getUint8Env("API_LOGGER_LEVEL", 4)

	// Load Tor configuration
	config.Tor.Address = getEnv("TOR_ADDRESS", "")
	config.Tor.Timeout = getDurationEnv("TOR_TIMEOUT", 30*time.Second)

	if err := config.Validate(); err != nil {
		return Config{}, err
	}

	return config, nil
}

// getEnv returns the environment variable value or a default if not set
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getDurationEnv returns a duration from environment variable or a default
func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// getUint8Env returns a uint8 from environment variable or a default
func getUint8Env(key string, defaultValue uint8) uint8 {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseUint(value, 10, 8); err == nil {
			return uint8(parsed)
		}
	}
	return defaultValue
}

// Validate returns an error if the configuration is not valid.
func (c Config) Validate() error {
	if err := validateLoggers(
		c.API.Logger,
		c.Server.Logger,
	); err != nil {
		return err
	}

	return validateAddresses(c.Server.Address, c.Tor.Address)
}

func validateLoggers(loggers ...Logger) error {
	for _, logger := range loggers {
		// Not importing logger constants to avoid cycle
		if logger.Level > 5 {
			return errors.Errorf("invalid logger %q. Level should be between 0 and 5", logger.Label)
		}
	}

	return nil
}

func validateAddresses(addresses ...string) error {
	for _, address := range addresses {

		if address == "" {
			continue
		}
		if !strings.HasPrefix(address, "http") && !strings.Contains(address, ":") {
			address = "http://" + address
		}
		if _, err := url.Parse(address); err != nil {
			return errors.Wrapf(err, "invalid address: %s", address)
		}
	}

	return nil
}
