import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import axios from "axios";

/**
 * @description controller to log the ip address of the client
 * @param req Request
 * @param res Response
 * @returns void
 * @example logIpAddress(req, res);
 * @since 1.0.0
 * @version 1.0.0
 * @access public
 * @alias logIpAddress
 */

class TaskController {
  private clientIp: string | string[] | null;
  private geoLocationUrl: string;

  constructor() {
    this.clientIp = "";
    this.geoLocationUrl = "";
    this.logIpAddress = this.logIpAddress.bind(this);
  }

  public logIpAddress(req: Request, res: Response): void {
    this.clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";

    if (Array.isArray(this.clientIp)) {
      this.clientIp = this.clientIp[0];
    }

    this.geoLocationUrl = `https://ipinfo.io/${this.clientIp}/geo`;

    axios
      .get(this.geoLocationUrl)
      .then((response) => {
        const location = response.data;
        res.status(StatusCodes.OK).json({
          ip: `You're requesting for this resource from IP address: ${this.clientIp}`,
          geoLocation: {
            ip: location.ip,
            city: location.city,
            region: location.region,
            country: location.country,
            timezone: location.timezone,
            long: location.loc.split(",")[0],
            lat: location.loc.split(",")[1],
          },
        });
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: error.message,
        });
      });
  }
}

export const taskController = new TaskController();
